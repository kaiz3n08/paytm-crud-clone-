import express from "express";
import { userRoute } from "./src/routes/userLogin.js";
import "dotenv/config";
const app = express();
app.use(express.json());
app.use("/paytm", userRoute);
app.listen(process.env.PORT, () => {
    console.log("Server Started!");
});
//# sourceMappingURL=index.js.map