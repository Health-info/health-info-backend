const express = require('express');
const router = express.Router();
const { Smallpart } = require('../models');

/**
 * @swagger
 *
 * /exercise:
 *  post:
 *    summary: "Exercises 조회"
 *    description: "POST 방식으로 Exercises를 조회한다."
 *    tags: [Exercises]
 *    requestBody:
 *      description: 사용자가 서버로 전달하는 값에 따라 결과 값은 다릅니다. (Exercises 조회)
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              SmallpartId:
 *                type: integer
 *                description: "SmallpartId"
 *                required: true
 *                default: 1
 *    responses:
 *      "200":
 *        description: 사용자가 서버로 전달하는 값에 따라 결과 값은 다릅니다.
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                code:
 *                  type: integer
 *                  default: 200
 *                payload:
 *                  type: array
 *                  example: [{"id": 1, "Smallpartid": 1, description": "좋은 운동입니다.", "name" : "Shoulder Press"}]
 */

 router.post('/', async (req, res, next) => {
    try {
      const smallpart = await Smallpart.findOne({ where: { id: req.body.SmallpartId } });
      if (smallpart) {
        const exercises  = await smallpart.getExercises();
        res.status(200).json({
          code: 200,
          payload: exercises,
        });
      } else {
        res.status(404).json({message: 'no such smallpart'});
      }
    } catch (error) {
      console.error(error);
      next(error);
    }
});

module.exports = router;
