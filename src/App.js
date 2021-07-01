import React from "react";
import './App.css';
import { useState, useEffect } from 'react';
import Post from "./Post.js";
import EkoClient, { EkoPostTargetType, FeedRepository, PostRepository } from 'eko-sdk';
import { SdkConfig } from "./sdk-config";
import { db, auth } from "./firebase";
import { makeStyles } from '@material-ui/core/styles';
import Modal from '@material-ui/core/Modal';
import { Button, Input } from "@material-ui/core";
import ImageUpload from "./ImageUpload";


console.log("LOADING FILE");

function getModalStyle() {
  const top = 50
  const left = 50

  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`,
  };
}

const useStyles = makeStyles((theme) => ({
  paper: {
    position: 'absolute',
    width: 400,
    backgroundColor: theme.palette.background.paper,
    border: '2px solid #000',
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  },
}));

//use componentDidMount in development to avoid any reloading issues (2 instances created)
const client = new EkoClient({ apiKey: SdkConfig.SAMPLE_APP_KEY });



function App() {
  const classes = useStyles();
  const [modalStyle] = React.useState(getModalStyle);

  const [post, setPost] = useState([]);
  const [open, setOpen] = useState(false);
  const [openSignIn, setOpenSignIn] = useState(false);
  const [username, setUsername] = useState("");
  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null);
  const [openUpload, setOpenUpload] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((authUser) => {
      //user has logged in...
      if(authUser) {
        console.log(authUser)
        setUser(authUser);
        //handle SDK-Amity user setup here
        client.registerSession({
          userId: authUser.uid,
          displayName: authUser.displayName,
        });
        console.log(client)
      } else {
        setUser(null)
        //handle SDK-Amity user logout here
      }
    })
    return () => {
      //cleanup action
      unsubscribe();
    }
  }, [user, username])


  useEffect(() => {
    db.collection("posts").orderBy("timestamp", "desc").onSnapshot(snapshot => {
      //this fires everytime the database changes
      setPost(snapshot.docs.map(doc => ({
        id: doc.id, 
        post: doc.data()
      })));
    })
  }, []) 

  const signUp = (event) => {
    event.preventDefault();

    auth
    .createUserWithEmailAndPassword(email, password)
    .then((authUser) => {
      return authUser.user.updateProfile({
        displayName: username
      })
    })
    .catch((error) => alert(error.message));

    setOpen(false);
  };

  const signIn = (event) => {
    event.preventDefault();

    auth
    .signInWithEmailAndPassword(email, password)
    .catch((error) => alert(error.message));

    setOpenSignIn(false);
  }

  const signOut = async () => {
    await client.unregisterSession();
    await auth.signOut()
  }

  return (
    <div className="app">

      <Modal
        open={open}
        onClose={() => setOpen(false)}
      >
        <div style={modalStyle} className={classes.paper}>
          <form className="app__signup">
            <center>
              <h3>Sign Up</h3>
            </center>
            <Input 
              placeholder="username"
              type="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <Input 
              placeholder="email"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input 
              placeholder="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button type="submit" onClick={signUp}>Sign Up</Button>
          </form>
        </div>
      </Modal>

      <Modal
        open={openSignIn}
        onClose={() => setOpenSignIn(false)}
      >
        <div style={modalStyle} className={classes.paper}>
          <form className="app__signup">
            <center>
              <h3>Login</h3>
            </center>
            <Input 
              placeholder="email"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input 
              placeholder="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button type="submit" onClick={signIn}>Sign In</Button>
          </form>
        </div>
      </Modal>

      <div className="app__header">
        <img
          className="app_headerImage"
          src="https://cdn.dribbble.com/users/31629/screenshots/2189205/puppy.png?compress=1&resize=800x600"
          alt="headerImg"
        />
        <Button type="submit" onClick={() => setOpenUpload(!openUpload)}>
          Upload
        </Button>
        {user ? (
        <Button onClick={() => signOut()}>Logout</Button>
        ): (
        <div className="app__loginContrainer">
          <Button onClick={() => setOpenSignIn(true)}>Sign In</Button>
          <Button onClick={() => setOpen(true)}>Sign Up</Button>
        </div>
        )}
      </div>
      {user?.displayName && openUpload && (
        <ImageUpload username={user.displayName}/>
        ) 
      }
      <div className="app__posts">
        <div>
          {
            post.map(({id, post}) => (
              <Post 
                username={post.username} 
                user={user} 
                postId={id} 
                caption={post.caption} 
                imageUrl={post.imageUrl} 
                key={id}
                likeCount={post.likeCount}
                >
              </Post>
            ))
          }
        </div>
      </div>
    </div>
  );
}

export default App;
