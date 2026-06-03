const messageRouter = require("express").Router();
const { json } = require("body-parser");
const Messages = require("../models/Messages");

//add
messageRouter.post("/", async (req, res) => {
  const newMessage = new Messages(req.body);
  try {
    const message = await newMessage.save();
    res.status(200).json(message);
  } catch (error) {
    res.status(500).json(error);
  }
});

//get
messageRouter.get("/:conversationId", async (req, res) => {
  try {
    const messages = await Messages.find({
      conversationId: req.params.conversationId,
    });
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = messageRouter;
