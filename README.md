# Vrit Kanban Board

Vrit Kanban Board is a feature-rich Kanban board application built with **React**, **TypeScript**, and **Vite**. It allows users to create, update, and delete columns and tasks, as well as drag-and-drop tasks between columns seamlessly.

---

## 🚀 Features

- Create, update, and delete columns and tasks
- Drag-and-drop tasks between columns
- Built with modern development tools and practices

---

## 🛠️ Technology Choices and Rationale

- **React**: Chosen for its component-based architecture and strong community support.
- **TypeScript**: Enables catching errors at compile time and improves code quality.
- **Vite**: Selected for its fast build times and excellent developer experience.
- **Tailwind CSS**: Utility-first framework for rapid and flexible UI development.
- **Dnd-kit**: A modern drag-and-drop library with an easy-to-use API, tailored for React applications.

---

## Setup Instructions

1. **Clone the repository**:
   ```sh
   git clone https://github.com/your-username/vrit-kanban-board.git
   cd vrit-kanban-board
   
2. Install Dependencies
```
npm install
```


3. Run the development server:
```
npm run dev
```

## ⚡ Known Limitations/Trade-offs
1. State Management:
- The app uses React's useState and useMemo for local state management.
For larger applications, a more robust solution like Redux or Zustand might be required.
- For larger applications, a more robust solution like Redux or Zustand might be required.

2. Accessibility:
- Current drag-and-drop functionality may not fully meet accessibility standards.
 Improvements are needed for users with disabilities, including screen reader and keyboard navigation support.

# Performance:
- Optimized for small to medium-sized boards.
- May experience performance degradation with a large number of tasks and columns.

## 🚧 Future Improvements
1. State Management:
- Integrate a state management library like Redux or Zustand for better handling of complex state interaction.
2. Backend Integration
- Add backend support to persist data and enable multi-user collaboration.
3. Accessibility:
- Enhance accessibility with keyboard navigation and screen reader support for drag-and-drop features.
4. Testing:
- Introduce unit and integration tests to ensure reliability and maintainability.
5. Styling:
- Elevate the UI/UX with advanced animations, transitions, and a more polished design.







