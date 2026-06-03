const conversationsRouter = require("express").Router();
const Conversations = require("../models/Conversation");

//new conversation
conversationsRouter.post("/", async (req, res) => {
  const newConversation = new Conversations({
    members: [req.body.senderId, req.body.receiverId],
  });

  try {
    const savedConversation = await newConversation.save();
    res.status(200).json(savedConversation);
  } catch (error) {
    res.status(500).json(error);
  }
});

//get a conversation
conversationsRouter.get("/:userId", async (req, res) => {
  try {
    const conversation = await Conversations.find({
      members: { $in: [req.params.userId] },
    });
    res.status(200).json(conversation);
  } catch (error) {
    res.status(500).json(error);
  }
});

//get conversation with two userId
conversationsRouter.get("/find/:firstUser/:secondUser", async (req, res) => {
  try {
    const conversation = await Conversations.findOne({
      members: { $all: [req.params.firstUser, req.params.secondUser] },
    });
    res.status(200).json(conversation);
  } catch (error) {
    console.log(error);
  }
});

module.exports = conversationsRouter;
