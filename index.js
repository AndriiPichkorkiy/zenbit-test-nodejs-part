const express = require("express");
const cors = require("cors");
const app = express();
const fs = require("fs/promises");
const path = require("path");
const Joi = require("joi");

const PORT = process.env.PORT || 80;

const messageSchema = Joi.object().keys({
  name: Joi.string()
    .pattern(
      /^[a-zA-ZА-ЩЬЮЯҐЄІЇа-щьюяґєії]+(([' -][a-zA-ZА-ЩЬЮЯҐЄІЇа-щьюяґєії ])?[a-zA-ZА-ЩЬЮЯҐЄІЇа-щьюяґєії]*)*$/
    )
    .required(),
  email: Joi.string()
    .pattern(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/)
    .required(),
  message: Joi.string().required(),
});

const {
  getAllMessages,
  getMessageById,
  removeMessage,
  addMessage,
} = require("./models/messages");

app.use(cors());

// app.use(express.urlencoded());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/messages", async (req, res, next) => {
  try {
    const list = await getAllMessages();
    res.json(list);
  } catch (error) {
    next(error);
  }
});

app.get("/messages:messageId", async (req, res, next) => {
  try {
    const { messageId } = req.params;

    const result = await getMessageById(messageId);
    if (result === null)
      throw RequestError(404, `There are no message with id: ${messageId}`);

    res.json(result);
  } catch (error) {
    next(error);
  }
});

app.post("/messages", async (req, res, next) => {
  console.log(req.body);
  try {
    const { body } = req;
    const { error } = messageSchema.validate(body);
    console.log("error", error);
    if (error) throw RequestError(400, error.details[0].message);

    const list = await addMessage(req.body);
    res.json(list);
  } catch (error) {
    next(error);
  }
});

app.delete("/messages:messageId", async (req, res, next) => {
  try {
    const { messageId } = req.params;

    const result = await removeMessage(messageId);

    if (result === null)
      throw RequestError(404, `There are no message with id: ${messageId}`);

    res.json(result);
  } catch (error) {
    next(error);
  }
});

app.use((req, res) => {
  res.status(404).json({ message: "Not found" });
});

app.use((err, req, res, next) => {
  const { status = 500, message = "Server error" } = err;
  res.status(status).json({ message });
});

app.listen(PORT, (error) => {
  if (error) console.log(error);
  else console.log(`Server was runned on Port ${PORT}`);
});
