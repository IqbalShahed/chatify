import express from 'express';

const router = express.Router();

router.get("/getMessage", (req, res)=> {
    res.send("Messages");
})

export default router;