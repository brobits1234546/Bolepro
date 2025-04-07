import React, { useState, useEffect } from 'react';
import { PlusCircle, Calendar, Book, Bell, CheckCircle2, Clock, Trash2, ListTodo, CheckSquare, Plus, Home, AlertCircle } from 'lucide-react';
import { format, differenceInDays, parseISO } from 'date-fns';

interface Task {
  id: string;
  title: string;
  type: 'homework' | 'assignment' | 'other';
  customType?: string;
  dueDate: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  notes?: string;
}

type Tab = 'all' | 'homework' | 'assignments' | 'completed';

function App() {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const savedTasks = localStorage.getItem('tasks');
    return savedTasks ? JSON.parse(savedTasks) : [];
  });
  const [activeTab, setActiveTab] = useState<Tab>('all');
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTask, setNewTask] = useState('');
  const [taskType, setTaskType] = useState<Task['type']>('homework');
  const [customType, setCustomType] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<Task['priority']>('medium');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim() || !dueDate) return;
    if (taskType === 'other' && !customType.trim()) return;

    const task: Task = {
      id: Date.now().toString(),
      title: newTask,
      type: taskType,
      customType: taskType === 'other' ? customType : undefined,
      dueDate,
      completed: false,
      priority,
      notes: notes.trim() || undefined
    };

    setTasks([...tasks, task]);
    setNewTask('');
    setDueDate('');
    setCustomType('');
    setPriority('medium');
    setNotes('');
    setIsAddingTask(false);
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const getTypeIcon = (type: Task['type']) => {
    switch (type) {
      case 'homework': return <Book className="w-5 h-5" />;
      case 'assignment': return <CheckCircle2 className="w-5 h-5" />;
      case 'other': return <Calendar className="w-5 h-5" />;
    }
  };

  const getDisplayType = (task: Task) => {
    if (task.type === 'other' && task.customType) {
      return task.customType;
    }
    return task.type;
  };

  const getDueDateColor = (dueDate: string) => {
    const days = differenceInDays(parseISO(dueDate), new Date());
    if (days < 0) return 'text-red-600';
    if (days <= 2) return 'text-orange-500';
    if (days <= 7) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
    }
  };

  const filteredTasks = tasks.filter(task => {
    switch (activeTab) {
      case 'homework':
        return task.type === 'homework' && !task.completed;
      case 'assignments':
        return task.type === 'assignment' && !task.completed;
      case 'completed':
        return task.completed;
      default:
        return !task.completed;
    }
  });

  const TabButton = ({ tab, icon, label }: { tab: Tab; icon: React.ReactNode; label: string }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
        activeTab === tab
          ? 'bg-indigo-600 text-white shadow-lg scale-105'
          : 'bg-white text-gray-600 hover:bg-indigo-50'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-purple-100">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Book className="w-8 h-8 text-indigo-600" />
              <h1 className="text-2xl font-bold text-gray-900">StudyTracker</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-indigo-600 relative">
                <Bell className="w-6 h-6" />
                {tasks.filter(t => !t.completed).length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {tasks.filter(t => !t.completed).length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setIsAddingTask(true)}
                className="p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors shadow-lg"
              >
                <Plus className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex space-x-4 overflow-x-auto pb-4">
          <TabButton tab="all" icon={<Home className="w-5 h-5" />} label="All Tasks" />
          <TabButton tab="homework" icon={<Book className="w-5 h-5" />} label="Homework" />
          <TabButton tab="assignments" icon={<ListTodo className="w-5 h-5" />} label="Assignments" />
          <TabButton tab="completed" icon={<CheckSquare className="w-5 h-5" />} label="Completed" />
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 pb-8">
        {isAddingTask ? (
          /* Add Task Form */
          <div className="bg-white rounded-lg shadow-lg p-6 transform transition-all duration-300">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Add New Task</h2>
              <button
                onClick={() => setIsAddingTask(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <form onSubmit={addTask} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Task Title
                </label>
                <input
                  type="text"
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  placeholder="Enter task title..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Task Type
                  </label>
                  <select
                    value={taskType}
                    onChange={(e) => {
                      setTaskType(e.target.value as Task['type']);
                      if (e.target.value !== 'other') {
                        setCustomType('');
                      }
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="homework">Homework</option>
                    <option value="assignment">Assignment</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as Task['priority'])}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              {taskType === 'other' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Specify Task Type
                  </label>
                  <input
                    type="text"
                    value={customType}
                    onChange={(e) => setCustomType(e.target.value)}
                    placeholder="Enter custom task type..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Due Date
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any additional notes..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 h-24"
                />
              </div>
              <button
                type="submit"
                className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 flex items-center justify-center space-x-2 transform transition-transform hover:scale-105"
              >
                <PlusCircle className="w-5 h-5" />
                <span>Create Task</span>
              </button>
            </form>
          </div>
        ) : (
          /* Task List */
          <div className="space-y-4">
            {filteredTasks.map(task => (
              <div
                key={task.id}
                className="bg-white rounded-lg shadow-lg p-6 transform transition-all duration-300 hover:scale-[1.02]"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <button
                        onClick={() => toggleTask(task.id)}
                        className={`p-2 rounded-full transition-colors ${
                          task.completed ? 'text-green-500 bg-green-50' : 'text-gray-400 hover:text-indigo-600 hover:bg-indigo-50'
                        }`}
                      >
                        <CheckCircle2 className="w-6 h-6" />
                      </button>
                      <h3 className={`text-xl font-medium ${
                        task.completed ? 'line-through text-gray-500' : 'text-gray-900'
                      }`}>
                        {task.title}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                    </div>
                    <div className="ml-11 space-y-2">
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center space-x-1">
                          {getTypeIcon(task.type)}
                          <span className="capitalize">{getDisplayType(task)}</span>
                        </span>
                        <span className={`flex items-center space-x-1 ${getDueDateColor(task.dueDate)}`}>
                          <Clock className="w-4 h-4" />
                          <span>{format(parseISO(task.dueDate), 'MMM d, yyyy')}</span>
                          {differenceInDays(parseISO(task.dueDate), new Date()) <= 2 && (
                            <AlertCircle className="w-4 h-4" />
                          )}
                        </span>
                      </div>
                      {task.notes && (
                        <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                          {task.notes}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
            {filteredTasks.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <Book className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg">No tasks found in this category!</p>
                <button
                  onClick={() => setIsAddingTask(true)}
                  className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 inline-flex items-center space-x-2"
                >
                  <Plus className="w-5 h-5" />
                  <span>Add New Task</span>
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;