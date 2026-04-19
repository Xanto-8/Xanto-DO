import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Todo {
  id: string
  text: string
  completed: boolean
  createdAt: Date
  pomodoroCount: number
}

interface PomodoroState {
  timeLeft: number
  duration: number
  isRunning: boolean
  isFinished: boolean
}

export interface UserData {
  todos: Todo[]
  pomodoroStates: Record<string, PomodoroState>
}

export interface User {
  username: string
  password: string
  createdAt: Date
  userData: UserData
}

interface AuthStore {
  currentUser: User | null
  users: User[]
  isLoggedIn: boolean
  login: (username: string, password: string) => { success: boolean; error?: string }
  register: (username: string, password: string) => { success: boolean; error?: string }
  logout: () => void
  updateUserData: (userData: Partial<UserData>) => void
}

const defaultUserData: UserData = {
  todos: [],
  pomodoroStates: {},
}

const defaultPomodoroState: PomodoroState = {
  timeLeft: 25 * 60,
  duration: 25 * 60,
  isRunning: false,
  isFinished: false,
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      currentUser: null,
      users: [],
      isLoggedIn: false,
      
      login: (username, password) => {
        const { users } = get()
        const user = users.find(u => u.username === username)
        if (!user) {
          return { success: false, error: '账号不存在' }
        }
        if (user.password !== password) {
          return { success: false, error: '密码错误' }
        }
        set({ 
          currentUser: {
            ...user,
            userData: user.userData || { ...defaultUserData },
          },
          isLoggedIn: true 
        })
        return { success: true }
      },
      
      register: (username, password) => {
        const { users } = get()
        const existingUser = users.find(u => u.username === username)
        if (existingUser) {
          return { success: false, error: '账号已存在' }
        }
        const newUser: User = {
          username,
          password,
          createdAt: new Date(),
          userData: { ...defaultUserData },
        }
        set({
          users: [...users, newUser],
          currentUser: newUser,
          isLoggedIn: true,
        })
        return { success: true }
      },
      
      logout: () => {
        set({ currentUser: null, isLoggedIn: false })
      },
      
      updateUserData: (userData) => {
        set((state) => {
          if (!state.currentUser) return state
          const updatedUser = {
            ...state.currentUser,
            userData: {
              ...state.currentUser.userData,
              ...userData,
            },
          }
          const updatedUsers = state.users.map(u =>
            u.username === state.currentUser!.username ? updatedUser : u
          )
          return {
            currentUser: updatedUser,
            users: updatedUsers,
          }
        })
      },
    }),
    {
      name: 'xanto-auth-storage',
      version: 1,
      migrate: (persistedState: any) => {
        if (persistedState) {
          if (persistedState.users) {
            persistedState.users = persistedState.users.map((u: User) => ({
              ...u,
              userData: u.userData || { ...defaultUserData },
            }))
          }
          if (persistedState.currentUser) {
            persistedState.currentUser = {
              ...persistedState.currentUser,
              userData: persistedState.currentUser.userData || { ...defaultUserData },
            }
          }
        }
        return persistedState
      },
    }
  )
)

export const useTodoStore = () => {
  const currentUser = useAuthStore((state) => state.currentUser)
  const updateUserData = useAuthStore((state) => state.updateUserData)

  const todos = currentUser?.userData?.todos || []
  const pomodoroStates = currentUser?.userData?.pomodoroStates || {}

  const addTodo = (text: string) => {
    const newTodo: Todo = {
      id: Date.now().toString(),
      text,
      completed: false,
      createdAt: new Date(),
      pomodoroCount: 0,
    }
    updateUserData({ todos: [...todos, newTodo] })
  }

  const toggleTodo = (id: string) => {
    updateUserData({
      todos: todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      ),
    })
  }

  const deleteTodo = (id: string) => {
    const newPomodoroStates = { ...pomodoroStates }
    delete newPomodoroStates[id]
    updateUserData({
      todos: todos.filter((todo) => todo.id !== id),
      pomodoroStates: newPomodoroStates,
    })
  }

  const incrementPomodoro = (id: string) => {
    updateUserData({
      todos: todos.map((todo) =>
        todo.id === id ? { ...todo, pomodoroCount: todo.pomodoroCount + 1 } : todo
      ),
    })
  }

  const initPomodoro = (id: string, duration: number) => {
    updateUserData({
      pomodoroStates: {
        ...pomodoroStates,
        [id]: { timeLeft: duration, duration, isRunning: false, isFinished: false },
      },
    })
  }

  const updatePomodoro = (id: string, updates: Partial<PomodoroState>) => {
    updateUserData({
      pomodoroStates: {
        ...pomodoroStates,
        [id]: { ...pomodoroStates[id], ...updates },
      },
    })
  }

  const resetPomodoro = (id: string) => {
    updateUserData({
      pomodoroStates: {
        ...pomodoroStates,
        [id]: { timeLeft: 25 * 60, duration: 25 * 60, isRunning: false, isFinished: false },
      },
    })
  }

  const getPomodoro = (id: string): PomodoroState => {
    return pomodoroStates[id] || defaultPomodoroState
  }

  const clearPomodoroFinish = (id: string) => {
    const existing = pomodoroStates[id]
    if (!existing) return
    updateUserData({
      pomodoroStates: {
        ...pomodoroStates,
        [id]: { ...existing, isFinished: false },
      },
    })
  }

  return {
    todos,
    addTodo,
    toggleTodo,
    deleteTodo,
    incrementPomodoro,
    initPomodoro,
    updatePomodoro,
    resetPomodoro,
    getPomodoro,
    clearPomodoroFinish,
  }
}
