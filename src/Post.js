import "./Post.css";
import { useState, useEffect, useContext } from "react";
import Avatar from '@material-ui/core/Avatar';
import { db } from "./firebase";
import firebase from "firebase";
//Material UI
import FavoriteBorderIcon from '@material-ui/icons/FavoriteBorder';
import { Button } from "@material-ui/core";
import ChatBubbleOutlineRoundedIcon from '@material-ui/icons/ChatBubbleOutlineRounded';
import IconButton from '@material-ui/core/IconButton';
// SDK Amity
import { PostRepository, FeedRepository } from 'eko-sdk';


function Post({ postId, user, username, caption, imageUrl, likedPhoto }) {


    const [comments, setComments] = useState([])
    const [comment, setComment] = useState("")
    const [commentClick, setCommentClick] = useState(false)
    const [toggleLiked, setToggleLiked] = useState();
    const [postLikes, setPostLikes] = useState(0)
    const [likesArray, setLikesArray] = useState([])

    // const { firebase, FieldValue } = useContext(FirebaseContext);

    useEffect(() => {
        let unsubscribe;
        if (postId) {
            unsubscribe = db
            .collection("posts")
            .doc(postId)
            .collection("comments")
            .orderBy("timestamp", "desc")
            .onSnapshot((snapshot) => {
                setComments(snapshot.docs.map((doc) => doc.data()));
            })
        }

        return () => {
            unsubscribe();
        }
    }, [postId]);

    const postComment = (event) => {
        event.preventDefault();

        db.collection("posts").doc(postId).collection("comments").add({
            text: comment,
            username: user.displayName,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        })
        setComment("");
        setCommentClick(false);
    }

    // console.log(PostRepository)

    var postRef = db.collection("posts").doc(postId)
    postRef.get().then((doc) => {
        if(doc.exists) {
            let posts = doc.data()
            if(posts.likes.includes(user?.displayName)) {
                setToggleLiked(true)
            }
        }
    })

    useEffect(() => {
        var postRef = db.collection("posts").doc(postId)

        postRef.onSnapshot(((doc) => {
            let posts = doc.data()
            setLikesArray(posts.likes)
            setPostLikes(posts.likes.length)
        }))
    }, [postId, user?.displayName])




    const handleToggledLiked = async () => {

        await firebase.firestore().collection("posts").doc(postId).update({
            likes: toggleLiked ? firebase.firestore.FieldValue.arrayRemove(user.displayName) : firebase.firestore.FieldValue.arrayUnion(user.displayName)
        })

        setToggleLiked((toggleLiked) => !toggleLiked);

        console.log(`been clicked by ${user.displayName}`, toggleLiked)

        console.log("post like", likesArray.length)

    }

    return (
        <div className="post">
            <div className="post__header">
                <Avatar className="post__Avatar"></Avatar>
                <h3>{username}</h3>
            </div>
            <img className="post__image" src={imageUrl} alt="post-frame" />
            <div className="post__interactions">
                <IconButton
                    variant="raised" 
                    type="submit"
                    style={{ backgroundColor: 'transparent' }}
                    onClick={user?.displayName && handleToggledLiked}
                >
                    <FavoriteBorderIcon 
                        style={toggleLiked ? {fill: "#ED4956", backgroundColor: 'transparent'} : {backgroundColor: "transparent"}} 
                        className="post__interactions" 
                    />
                </IconButton>
                <p className="post__likes">{postLikes}</p>
                <Button type="submit" onClick={() => setCommentClick(!commentClick)} style={{ backgroundColor: 'transparent' }}>
                    <ChatBubbleOutlineRoundedIcon className="post__commentButton" />
                </Button>
            </div>
            <h4 className="post__text"><strong>{username}</strong>: {caption}</h4>
            <div className="post__comments">
                {comments.map((comment) => (
                    <p>
                        <strong>{comment.username}</strong> {comment.text}
                    </p>
                ))}
            </div>
            {user?.displayName && commentClick &&
            (<form className="post__commentBox">
                <input
                    className="post__input"
                    type="text"
                    placeholder="Add a comment..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                >
                
                </input>
                <button
                    disabled={!comment}
                    className="post__button"
                    type="submit"
                    onClick={postComment}
                >
                    Post
                </button>
            </form> )
            }
        </div>
    )
}

export default Post;
