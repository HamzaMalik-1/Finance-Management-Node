import express from 'express'
import { createCategory, deleteCategory, getAllCategories, getCategoryTree, getPaginatedCategories, updateCategory } from '../../controllers/v1/categoryController.js'

const router = express.Router()

router.post('/',createCategory)
router.delete('/:id',deleteCategory)
router.get('/all/:userId',getAllCategories)
router.get('/tree/:userId',getCategoryTree)
router.put('/:id', updateCategory); 
router.get('/:userId',getPaginatedCategories)



export default router