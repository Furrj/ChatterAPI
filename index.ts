import express, { Express, Request, Response } from "express";
import mongoose, { Model } from "mongoose";
import cors from "cors";
import path from "path";
import bcrypt from "bcrypt";
import session from "express-session";
import cookieParser from "cookie-parser";

const PORT = process.env.PORT || 5000;

//MONGOOSE
mongoose.connect(
  "mongodb+srv://FraterSKS:ZV0bCxEm1jJihPIk@cluster0.ttqf2bz.mongodb.net/chatter?retryWrites=true&w=majority"
);
import { IPost } from "./models/Post";
require("./models/Post");
const Post: Model<IPost> = mongoose.model<IPost>("Post");
import { IUser } from "./models/User";
import { userInfo } from "os";
require("./models/User");
const User: Model<IUser> = mongoose.model<IUser>("User");

const app = express();

app.use(express.static(path.join(__dirname, "..", "build")));
app.use(cors({ credentials: true }));
app.use(express.json());
app.use(cookieParser());
declare module "express-session" {
  interface SessionData {
    userInfo: userSend;
  }
}
app.use(
  session({
    secret: "ABCDEFG",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 15 },
  })
);

//TS
//TYPES
type userInfo = {
  username: string;
  password: string;
  valid: boolean;
};

type userSend = {
  username: string;
  id: string;
  valid: boolean;
};

const invalidUser: userSend = {
  username: "",
  id: "",
  valid: false,
};

//GET ALL POSTS
app.get("/api", async (req, res) => {
  const { id } = req.body;
  try {
    const posts = await Post.find({}).populate("author");

    if (posts) {
      res.json(posts);
    }
  } catch (e) {
    console.log(`Error: ${e}`);
    res.json(`Error: ${e}`);
  }
});

//GET USER INFO
app.put("/api/user", async (req, res) => {
  const { id } = req.body;
  try {
    const user = await User.findById(id).populate("posts");

    if (user) {
      res.json(user);
    }
  } catch (e) {
    console.log(`Error: ${e}`);
    res.json(`Error: ${e}`);
  }
});

//SUBMIT NEW POST
app.post("/api/newPost", async (req, res) => {
  const { text, date, community, user, guestAuthor } = req.body;
  const newPost = new Post({ text, date, community, likes: 0, dislikes: 0 });
  try {
    if (user) {
      const foundUser: any = await User.findById(user);
      if (foundUser) {
        foundUser.posts.push(newPost);
        newPost.author = foundUser;
        await foundUser.save();
        const saved = await newPost.save();
        res.json(saved);
      }
    } else {
      newPost.guestAuthor = guestAuthor;
      const saved = await newPost.save();
      res.json(saved);
    }
  } catch (e) {
    console.log(`Error: ${e}`);
    res.json(`Error: ${e}`);
  }
});

//UPDATE POST
app.put("/api/update", async (req, res) => {
  const { id, action } = req.body;
  try {
    if (action === "upvote") {
      const foundPost = await Post.findById(id);
      if (foundPost) {
        foundPost.likes++;
        await foundPost.save();
      }
    } else {
      const foundPost = await Post.findById(id);
      if (foundPost) {
        foundPost.dislikes++;
        await foundPost.save();
      }
    }
  } catch (e) {
    console.log(`Error: ${e}`);
    res.json(`Error: ${e}`);
  }
});

//DELETE POST
app.put("/api/deletePost", async (req, res) => {
  const { postID, userID } = req.body;
  try {
    const deleted = await Post.findByIdAndDelete(postID);
    const foundUser = await User.findById(userID);
    if (foundUser) {
      await foundUser.updateOne({ $pull: { posts: postID } });
      await foundUser.save();
    }
    res.json(deleted);
  } catch (e) {
    console.log(`Error: ${e}`);
    res.json(`Error: ${e}`);
  }
});

//VALIDATE USER
app.get("/validate", (req, res) => {
  if (req.session.userInfo) {
    if (req.session.userInfo.valid === false) {
      res.json(invalidUser);
    } else {
      res.json(req.session.userInfo);
    }
  }
});

//REGISTER USER
app.post(
  "/register",
  async (req, res): Promise<Response<any, Record<string, any>>> => {
    const { username, password }: userInfo = req.body;
    const invalidUser: userSend = { username: "", id: "", valid: false };

    //CHECK IF USERNAME ALREADY EXISTS
    const userQuery: Model<IUser> | any = await User.findOne({ username });
    if (userQuery) {
      return res.json(invalidUser);
    }

    //ENCRYPT PASSWORD
    const hash: string = await bcrypt.hash(password, 12);

    //CREATE AND SAVE NEW USER
    const newUser = new User({
      username,
      password: hash,
    });

    await newUser.save();

    req.session.userInfo = {
      username: newUser.username,
      id: newUser._id,
      valid: true,
    };

    return res.json(req.session.userInfo);
  }
);

//LOGIN USER
app.post(
  "/login",
  async (req, res): Promise<Response<any, Record<string, any>>> => {
    const { username, password }: userInfo = req.body;
    const invalidUser: userSend = { username: "", id: "", valid: false };

    const userQuery: Model<IUser> | any = await User.findOne({ username });
    if (!userQuery) {
      return res.json(invalidUser);
    }

    const checkPassword: boolean = await bcrypt.compare(
      password,
      userQuery.password
    );
    if (checkPassword) {
      req.session.userInfo = {
        username: userQuery.username,
        id: userQuery._id,
        valid: true,
      };
      return res.json({
        username: userQuery.username,
        id: userQuery._id,
        valid: true,
      });
    } else {
      return res.json(invalidUser);
    }
  }
);

//LOGOUT USER
app.get("/logout", async (req, res) => {
  req.session.userInfo = invalidUser;
  res.json("deleted");
});

//UPDATE USER DATA
app.put("/api/user/update", async (req, res) => {
  const { id, name, age, gender, bio } = req.body;

  try {
    const foundUser = await User.findById(id);
    if (foundUser) {
      foundUser.name = name;
      foundUser.age = age;
      foundUser.gender = gender;
      foundUser.bio = bio;
      const savedUser = await foundUser.save();
      res.json(savedUser);
    }
  } catch (e) {
    console.log(`Error: ${e}`);
    res.json(`Error: ${e}`);
  }
});

//USER JOIN COMMUNITY
app.put("/api/user/communities", async (req, res) => {
  const { id, community } = req.body;
  console.log(req.body);

  const foundUser = await User.findById(id);
  try {
    if (foundUser) {
      foundUser.communities?.push(community);
      const savedUser = await foundUser.save();
      res.json(savedUser);
    }
  } catch (e) {
    console.log(`Error: ${e}`);
    res.json(`Error: ${e}`);
  }
});

app.get("/*", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "build", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}...`);
});
