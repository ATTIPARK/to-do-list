const express = require("express");
const { PrismaClient } = require("@prisma/client");

const router = express.Router();

const client = new PrismaClient();

// 투두 생성
router.post("/", async (req, res) => {
  try {
    const { todo, userId } = req.body;

    // 너무 정확한 에러 표시는 위험
    if (!todo) {
      return res.status(400).json({ ok: false, error: "Not exist todo." });
    }
    if (!userId) {
      return res.status(400).json({ ok: false, error: "Not exist userId" });
    }

    const user = await client.user.findUnique({
      where: {
        id: parseInt(userId),
      },
    });

    if (!user) {
      return res.status(400).json({ ok: false, error: "Not exist user." });
    }

    const newTodo = await client.todo.create({
      data: {
        todo,
        isDone: false,
        userId: user.id,
      },
    });

    res.json({ ok: true, todo: newTodo });
  } catch (error) {
    console.error(error);
  }
});

// 투두 조회
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { skip } = req.query;

    const user = await client.user.findUnique({
      where: {
        id: parseInt(userId),
      },
    });

    if (!user) {
      return res.status(400).json({ ok: false, error: "Not exist user." });
    }

    const todos = await client.todo.findMany({
      where: {
        userId: parseInt(userId),
      },
      orderBy: {
        createdAt: "desc",
      },
      skip: parseInt(skip),
      take: 3,
    });

    res.json({ ok: true, todos });
  } catch (error) {
    console.error(error);
  }
});

// 투두 완료
router.put("/:id/done", async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    // id를 통해서 투두가 존재하는지?
    // id를 통해서 투두의 상태 값을 확인

    const existTodo = await client.todo.findUnique({
      where: {
        id: parseInt(id),
      },
    });

    if (!existTodo) {
      return res.status(400).json({ ok: false, error: "Not exist todo." });
    }
    if (existTodo.userId !== parseInt(userId)) {
      return res.status(400).json({ ok: false, error: "U R not todo owner." });
    }

    const updatedTodo = await client.todo.update({
      where: {
        id: parseInt(id),
      },
      data: {
        isDone: !existTodo.isDone,
      },
    });

    res.json({ ok: true, todo: updatedTodo });
  } catch (error) {
    console.error(error);
  }
});

// 투두 삭제
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    const existTodo = await client.todo.findUnique({
      where: {
        id: parseInt(id),
      },
    });

    if (!existTodo) {
      return res.status(400).json({ ok: false, error: "Not exist todo." });
    }
    if (existTodo.userId !== parseInt(userId)) {
      return res.status(400).json({ ok: false, error: "U R not todo owner." });
    }

    const deletedTodo = await client.todo.delete({
      where: {
        id: parseInt(id),
      },
    });

    res.json({ ok: true, todo: deletedTodo });
  } catch (error) {
    console.error(error);
  }
});

module.exports = router;
