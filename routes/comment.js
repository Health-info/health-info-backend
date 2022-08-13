const express = require('express');

const router = express.Router();

const { User, Exercise, Comment } = require('../models');

/**
 * @swagger
 *
 * /comment/{ExerciseId}:
 *  get:
 *    summary: "특정 Exercise에 대한 Comment 조회"
 *    description: "get 방식으로 Exercise에 대한 댓글을 조회한다."
 *    tags: [Comment]
 *    parameters:
 *      - in: path
 *        name: ExerciseId
 *        required: true
 *        description: ExerciseId
 *        default: 1
 *        schema:
 *          type: number
 *    responses:
 *      "200":
 *        description: "UserId: 댓글 쓴사람 , Likers: 댓글에 좋아요 누른사람들"
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
 *                  example: [{"id": 1, "UserId": 2,"content": "이 운동 이렇게 하는거 아닌데", "Likers": [{"id": 3}, {"id": 4}, {"id": 5}]}]
 */


 router.get('/:ExerciseId', async (req, res, next) => {
    try {
        const exercise = await Exercise.findOne({ where: {id: req.params.ExerciseId}});
        if(exercise){
          const Comments = await exercise.getComments({ 
            include:{
              model: User,
              as: 'Likers',
              attributes: ['id']
          }});
          res.status(200).json({
            code: 200,
            payload: Comments,
          });
        }
        else {
            res.status(404).json({message: 'no such Exercise'}); 
        }
    } catch (err) {
        console.error(err);
        next(err);
    }
  });

/**
 * @swagger
 *
 * /comment:
 *  post:
 *    summary: "댓글 등록"
 *    description: "POST 방식으로 댓글을 등록한다."
 *    tags: [Comment]
 *    requestBody:
 *      description: 사용자가 서버로 전달하는 값에 따라 결과 값은 다릅니다.
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              ExerciseId:
 *                type: integer
 *                description: "ExerciseId"
 *                required: true
 *                default: 1
 * 
 *              content:
 *                type: string
 *                description: "댓글 내용"
 *                required: true
 *                default: "운동 개못하네 ㅋㅋ"
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
 *                message:
 *                  type: string
 *                  default: 'Comment register success'
 */

 router.post('/', async (req, res, next) => {
    try {
        const exercise = await Exercise.findOne({ where: {id: req.body.ExerciseId}});
        if(exercise){
          
          const comment = await Comment.create({
            UserId: req.user.id,
            content: req.body.content
          })
          await exercise.addComments([comment]);
          res.status(200).json({
            code: 200,
            message: 'Comment register success',
          });
        }
        else {
            res.status(404).json({message: 'no such Exercise'}); 
        }
    } catch (err) {
        console.error(err);
        next(err);
    }
    });


/**
 * @swagger
 *
 * /comment:
 *  delete:
 *    summary: "댓글 삭제"
 *    description: "DELETE 방식으로 댓글을 삭제한다."
 *    tags: [Comment]
 *    requestBody:
 *      description: 사용자가 서버로 전달하는 값에 따라 결과 값은 다릅니다.
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              CommentId:
 *                type: integer
 *                description: "CommentId"
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
 *                message:
 *                  type: string
 *                  default: 'Comment delete success'
 */

 router.delete('/', async (req, res, next) => {
    try {
        const comment = await Comment.destroy({ where: {id: req.body.CommentId}});
        if(comment){
          res.status(200).json({
            code: 200,
            message: 'Comment delete success',
          });
        }
        else {
            res.status(404).json({message: 'no such Comment'}); 
        }
    } catch (err) {
        console.error(err);
        next(err);
    }
    });
/**
 * @swagger
 *
 * /comment/like:
 *  post:
 *    summary: "댓글 좋아요"
 *    description: "POST 방식으로 댓글 좋아요를 등록한다."
 *    tags: [Comment]
 *    requestBody:
 *      description: 사용자가 서버로 전달하는 값에 따라 결과 값은 다릅니다.
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              CommentId:
 *                type: integer
 *                description: "CommentId"
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
 *                message:
 *                  type: string
 *                  default: "Like success"
 */

 router.post('/like' , async (req, res, next) => {
    try{
        const comment = await Comment.findOne({where: {id: req.body.CommentId}});
        if(comment){
            const user = await User.findOne({ where: { id: req.user.id } });
            if (user) {
            await user.addLikings(parseInt(req.body.CommentId, 10));
            res.status(200).json({
                code: 200,
                message: "Like success",
            });
            } else {
                res.status(404).json({
                message: 'no such user'
                });
            }
        }
        else {
            res.status(404).json({
            message: 'no such comment'
            });
        }
    } catch( error) {
        console.error(error);
        next(error);
    }
  });

/**
 * @swagger
 *
 * /comment/unlike:
 *  post:
 *    summary: "댓글 좋아요 취소"
 *    description: "POST 방식으로 댓글 좋아요를 취소한다."
 *    tags: [Comment]
 *    requestBody:
 *      description: 사용자가 서버로 전달하는 값에 따라 결과 값은 다릅니다.
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              CommentId:
 *                type: integer
 *                description: "CommentId"
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
 *                message:
 *                  type: string
 *                  default: "unLike success"
 */

 router.post('/unlike', async (req, res, next) => {
    try{
        const comment = await Comment.findOne({where: {id: req.body.CommentId}});
        if(comment){
            const user = await User.findOne({ where: { id: req.user.id } });
            if (user) {

            await user.removeLikings([comment]);
            res.status(200).json({
                code: 200,
                message: "unLike success",
            });
            } else {
                res.status(404).json({
                message: 'no such user'
                });
            }
        }
        else {
            res.status(404).json({
            message: 'no such comment'
            });
        }
    } catch( error) {
        console.error(error);
        next(error);
    }
  });

module.exports = router;
