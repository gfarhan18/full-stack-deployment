import { Router } from 'express';
import { supabase } from '../config/supabase.js';

const router = Router();

router.get('/', async (_req, res) => {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return res.status(500).json({ error: error.message });
  }
  res.json(data);
});

router.get('/:id', async (req, res) => {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('id', req.params.id)
    .maybeSingle();

  if (error) {
    return res.status(500).json({ error: error.message });
  }
  if (!data) {
    return res.status(404).json({ error: 'Task not found' });
  }
  res.json(data);
});

router.post('/', async (req, res) => {
  const { title, description = '', completed = false } = req.body;

  if (!title || typeof title !== 'string' || !title.trim()) {
    return res.status(400).json({ error: 'Title is required' });
  }

  const { data, error } = await supabase
    .from('tasks')
    .insert({
      title: title.trim(),
      description: String(description ?? '').trim(),
      completed: Boolean(completed),
    })
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }
  res.status(201).json(data);
});

router.put('/:id', async (req, res) => {
  const { title, description, completed } = req.body;
  const updates = {};

  if (title !== undefined) {
    if (typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({ error: 'Title cannot be empty' });
    }
    updates.title = title.trim();
  }
  if (description !== undefined) {
    updates.description = String(description).trim();
  }
  if (completed !== undefined) {
    updates.completed = Boolean(completed);
  }

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: 'No fields to update' });
  }

  const { data, error } = await supabase
    .from('tasks')
    .update(updates)
    .eq('id', req.params.id)
    .select()
    .maybeSingle();

  if (error) {
    return res.status(500).json({ error: error.message });
  }
  if (!data) {
    return res.status(404).json({ error: 'Task not found' });
  }
  res.json(data);
});

router.delete('/:id', async (req, res) => {
  const { data, error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', req.params.id)
    .select()
    .maybeSingle();

  if (error) {
    return res.status(500).json({ error: error.message });
  }
  if (!data) {
    return res.status(404).json({ error: 'Task not found' });
  }
  res.json({ message: 'Task deleted', task: data });
});

export default router;
