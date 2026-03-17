import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
    reactions: {
      type: [
        {
          emoji: { type: String, required: true },
          userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        },
      ],
      default: [],
    },
    readBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

MessageSchema.pre('validate', function() {
  if (!this.receiverId && !this.groupId) {
    throw new Error('Message must have a receiverId or a groupId.');
  }
});

export default mongoose.models.Message || mongoose.model("Message", MessageSchema);
