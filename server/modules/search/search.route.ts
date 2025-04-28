// routes/search.ts
import express from 'express';
import { search, getSearchSuggestions } from './search.controller';

const router = express.Router();

// GET /api/v1/search
router.get('/', search);

// GET /api/v1/search/suggestions
router.get('/suggestions', getSearchSuggestions);

export default router;