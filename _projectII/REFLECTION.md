# Reflection on Key Design Decisions and Future Improvements  

## Key Design Decisions  

### 1. Real-Time Updates with WebSockets  
To ensure users receive immediate feedback and updates, a **WebSocket** connection is opened when the course or question page is loaded.  
- This allows the server to push real-time updates about new database entries, such as new questions, answers, or changes to grading status.  
- **Rationale**: This decision enhances the user experience by reducing the need for manual page refreshes and enabling dynamic, real-time interaction, which is crucial for a responsive platform.

### 2. Database Design for User Interaction Priority  
The database was designed with the following requirement:  
> *"The questions and answers are sorted and shown based on recency that accounts for both the posting time and the last upvote time, whichever is more recent."*  

To meet this requirement efficiently:  
- Entries are sorted by timestamps (updated_at column, which is updated at creation and interaction) and prioritized based on user actions like upvotes and new entries.  
- **Rationale**: Prioritizing recent interactions and creations ensures that the most relevant and active content appears first, aligning with user expectations for engagement.  

---

## Reflection on Possible Improvements  

### 1. WebSocket Connection Management  
Opening a WebSocket connection on every page load could lead to unnecessary resource usage, particularly when many users access the platform simultaneously.  
- **Proposed Improvement**:  
   - Optimize WebSocket connections by implementing connection pooling or reusing connections where possible.  
   - Implement a fallback mechanism to gracefully degrade to **HTTP polling** when WebSocket limits are reached.  
---

## Conclusion  
The current design decisions, particularly the use of WebSockets for real-time updates and a database strategy that prioritizes recent interactions, provide a solid foundation for a scalable and user-friendly application. However, as the platform grows, optimizations in database performance, WebSocket management, and server load distribution will be essential to maintain responsiveness and scalability.  

## Note
Websocket connection not working in production and kubernetes environments, but working fine in development environment.  
