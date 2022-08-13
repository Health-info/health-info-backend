const express = require('express');

const router = express.Router();

const { Bigpart } = require('../models');

/**
 * @swagger
 *
 * /smallpart:
 *  post:
 *    summary: "Smallparts 조회"
 *    description: "POST 방식으로 Smallparts를 조회한다."
 *    tags: [Smallparts]
 *    requestBody:
 *      description: 사용자가 서버로 전달하는 값에 따라 결과 값은 다릅니다. (Smallparts 조회)
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              BigpartId:
 *                type: integer
 *                description: "BigpartId"
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
 *                  example: [{"id": 1, "Bigpartid": 1, "name" : "전면"}, {"id": 2, "Bigpartid": 1, "name" : "측면"}, {"id": 3, "Bigpartid": 1, "name" : "후면"}]
 */
 router.post('/', async (req, res) => {
    try{
      const bigpart = await Bigpart.findOne({
        where: {
          id: req.body.BigpartId,
        }
      });
      if(bigpart){
        const smallparts = await bigpart.getSmallparts();
        res.json({
          code:200,
          payload: smallparts,
        })     
      } else{
        res.status(404).json({message: 'no such bigpart'});
      }

    } catch(error) {
        console.error(error);
        return res.status(500).json({
          code: 500,
          message: '서버 에러',
        });   
    }
});

module.exports = router;
