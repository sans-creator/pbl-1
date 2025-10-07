import mongoose from "mongoose";

const MONGO_URI = "mongodb+srv://sanskar2427030089_db_user:CAYHusirGwNHyPBH@cluster0.dw8wyha.mongodb.net/auditoriumDB?retryWrites=true&w=majority"; // replace with your DB URI

const validAuditoriums = ["TMA PAI", "RAMDAS PAI", "SHARDA PAI"];
const defaultAuditorium = "TMA PAI";

async function fixAuditoriums() {
  try {
    await mongoose.connect(MONGO_URI);

    const result = await mongoose.connection.collection("events").updateMany(
      {
        $or: [
          { auditorium: { $exists: false } },
          { auditorium: "" },
          { auditorium: { $nin: validAuditoriums } },
          { auditorium: null },
        ],
      },
      { $set: { auditorium: defaultAuditorium } }
    );

    console.log(`✅ ${result.modifiedCount} events fixed to default auditorium: ${defaultAuditorium}`);
    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

fixAuditoriums();
