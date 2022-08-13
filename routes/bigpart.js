const express = require('express');

const router = express.Router();

const { Bigpart } = require('../models');

/**
 * @swagger
 *
 * /bigpart:
 *  get:
 *    summary: "Bigparts 조회"
 *    description: "GET 방식으로 Bigparts 를 조회한다.."
 *    tags: [Bigparts]
 *    responses:
 *      "200":
 *        description: 사용자가 서버로 전달하는 값에 따라 결과 값은 다릅니다. (유저 등록)
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
 *                  example: [{"id": 1, "name" : "어깨"}, {"id": 2, "name" : "하체"}]
 */
 router.get('/', (req, res) => {
  
    Bigpart.findAll({})
      .then((bigparts) => {
        res.json({
          code: 200,
          payload: bigparts,
        });
      })
      .catch((error) => {
        console.error(error);
        return res.status(500).json({
          code: 500,
          message: '서버 에러',
        });
      });
});

module.exports = router;
