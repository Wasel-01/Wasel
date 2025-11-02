import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase/client';

interface Todo {
  id: string;
  task: string;
  completed: boolean;
}

export function TodosExample() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function getTodos() {
      try {
        const { data, error } = await supabase
          .from('todos')
          .select('*');

        if (error) throw error;

        if (data && data.length > 0) {
          setTodos(data);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    getTodos();
  }, []);

  if (loading) return <div>Loading todos...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Todos</h2>
      <ul>
        {todos.map((todo) => (
          <li key={todo.id}>
            {todo.task} - {todo.completed ? '✅' : '⏳'}
          </li>
        ))}
      </ul>
    </div>
  );
}
