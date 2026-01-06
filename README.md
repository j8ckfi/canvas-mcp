# Canvas to Poke Integration Guide

## Overview

This project provides direct Canvas LMS API integration with Poke agents. Instead of using the MCP server wrapper (which requires persistent connections), this guide demonstrates how to use Canvas API tokens directly within Poke automations.

**Why Direct API Integration?**
- No external server dependencies
- - Works within Poke's existing automation framework
  - - Canvas API token-based authentication
    - - No OAuth flow required (perfect for institutional accounts)
     
      - ## Prerequisites
     
      - 1. **Canvas Account**: Access to jajags.instructure.com
        2. 2. **Poke Account**: Active Poke.com account
           3. 3. **Canvas API Token**: Generated with appropriate permissions
             
              4. ## Canvas API Token Setup
             
              5. ### Step 1: Generate a Canvas API Token
             
              6. 1. Log in to Canvas at `https://jajags.instructure.com/`
                 2. 2. Navigate to **Account Settings** → **Settings** (or direct: `/profile/settings`)
                    3. 3. Scroll to **Approved Integrations**
                       4. 4. Click **New Access Token**
                          5. 5. Fill in:
                             6.    - **Purpose**: "Poke Integration"
                                   -    - **Expires**: Select 120 days (May 6, 2026)
                                        - 6. Click **Generate Token**
                                          7. 7. **COPY AND SAVE** the token immediately (it won't be shown again)
                                            
                                             8. **Token Format**: `[number]~[token_string]`
                                             9. Example: `17740~C7Xz3AHmmFUN8PDJuQ3XGtQNfPP73UAY2LuU7aKQecKyW2Bv2ex7TxxFay9vx9VD`
                                            
                                             10. ### Step 2: Configure in Poke
                                            
                                             11. Store your Canvas API token securely in Poke settings or use it directly in automations.
                                            
                                             12. ## Canvas API Reference
                                            
                                             13. ### Base URL
                                             14. ```
                                                 https://jajags.instructure.com/api/v1
                                                 ```

                                                 ### Authentication Header
                                                 ```
                                                 Authorization: Bearer {YOUR_CANVAS_TOKEN}
                                                 ```

                                                 ###Common Endpoints

                                                 #### Get Current User Information
                                                 ```http
                                                 GET /api/v1/users/self
                                                 Authorization: Bearer {TOKEN}
                                                 ```

                                                 **Response Example**:
                                                 ```json
                                                 {
                                                   "id": 12345,
                                                   "name": "Jack",
                                                   "login_id": "jack@example.com",
                                                   "short_name": "Jack"
                                                 }
                                                 ```

                                                 #### Get User's Courses
                                                 ```http
                                                 GET /api/v1/courses?enrollment_state=active
                                                 Authorization: Bearer {TOKEN}
                                                 ```

                                                 **Query Parameters**:
                                                 - `enrollment_state`: active, invited, completed
                                                 - - `include[]`: teachers, total_students, term, course_progress
                                                  
                                                   - #### Get Course Assignments
                                                   - ```http
                                                     GET /api/v1/courses/{course_id}/assignments
                                                     Authorization: Bearer {TOKEN}
                                                     ```

                                                     #### Get Course Announcements
                                                     ```http
                                                     GET /api/v1/courses/{course_id}/discussion_topics?only_announcements=true
                                                     Authorization: Bearer {TOKEN}
                                                     ```

                                                     #### Get Assignment Submissions
                                                     ```http
                                                     GET /api/v1/courses/{course_id}/assignments/{assignment_id}/submissions/{user_id}
                                                     Authorization: Bearer {TOKEN}
                                                     ```

                                                     #### Get Grades
                                                     ```http
                                                     GET /api/v1/courses/{course_id}/enrollments?user_id={user_id}
                                                     Authorization: Bearer {TOKEN}
                                                     ```

                                                     ## Using Canvas API in Poke Automations

                                                     ### Method 1: Direct HTTP Requests in Poke

                                                     Poke automations can make HTTP requests to Canvas API. Example automation:

                                                     **"Get My Assignments" Automation**:
                                                     1. In Poke, create a new automation
                                                     2. 2. Add an HTTP request step:
                                                        3.    ```
                                                                 Method: GET
                                                                 URL: https://jajags.instructure.com/api/v1/courses?enrollment_state=active
                                                                 Header: Authorization: Bearer {YOUR_TOKEN}
                                                                 ```
                                                              3. Parse the JSON response to extract course information
                                                              4. 4. Send results via text or email
                                                                
                                                                 5. ### Method 2: Scheduled Daily Digest
                                                                
                                                                 6. Create an automation that runs daily and:
                                                                 7. 1. Fetches all active courses
                                                                    2. 2. Checks for new announcements
                                                                       3. 3. Compiles a summary
                                                                          4. 4. Texts you the digest
                                                                            
                                                                             5. **Steps**:
                                                                             6. - Trigger: Scheduled time (e.g., 8:00 AM)
                                                                                - - Action: GET `/api/v1/courses?enrollment_state=active`
                                                                                  - - Action: For each course, GET `/api/v1/courses/{id}/discussion_topics?only_announcements=true`
                                                                                    - - Action: Format results and send via Text Poke
                                                                                     
                                                                                      - ### Method 3: Assignment Deadline Reminders
                                                                                     
                                                                                      - Create reminders for upcoming assignment deadlines:
                                                                                      - 1. Fetch courses and assignments
                                                                                        2. 2. Filter for upcoming deadlines (next 3 days)
                                                                                           3. 3. Send text reminders
                                                                                             
                                                                                              4. ## Security Best Practices
                                                                                             
                                                                                              5. ⚠️ **Important Security Notes**:
                                                                                             
                                                                                              6. 1. **Never hardcode tokens** in public repositories
                                                                                                 2. 2. **Use environment variables** if storing in Poke (if supported)
                                                                                                    3. 3. **Token expiration**: Your token expires on May 6, 2026 (120-day default)
                                                                                                       4. 4. **Regenerate tokens** periodically
                                                                                                          5. 5. **Limit token scope**: Only grant necessary permissions
                                                                                                             6. 6. **Revoke unused tokens**: In Canvas Settings → Approved Integrations
                                                                                                               
                                                                                                                7. ## Testing Your Integration
                                                                                                               
                                                                                                                8. ### Using curl
                                                                                                                9. ```bash
                                                                                                                   # Test authentication
                                                                                                                   curl -H "Authorization: Bearer YOUR_TOKEN" \
                                                                                                                     https://jajags.instructure.com/api/v1/users/self

                                                                                                                   # Get courses
                                                                                                                   curl -H "Authorization: Bearer YOUR_TOKEN" \
                                                                                                                     https://jajags.instructure.com/api/v1/courses?enrollment_state=active
                                                                                                                   ```
                                                                                                                   
                                                                                                                   ### Using Poke's "Text Poke" Feature
                                                                                                                   You can ask Poke to:
                                                                                                                   - "Fetch my Canvas courses and list announcements"
                                                                                                                   - - "Tell me if I have any overdue assignments"
                                                                                                                     - - "Show me my grade in Biology 101"
                                                                                                                      
                                                                                                                       - Poke can use these automations with your Canvas token.
                                                                                                                      
                                                                                                                       - ## Canvas API Pagination
                                                                                                                      
                                                                                                                       - Canvas API uses limit/offset pagination. To get all results:
                                                                                                                      
                                                                                                                       - ```http
                                                                                                                         GET /api/v1/courses?per_page=100&page=1
                                                                                                                         ```
                                                                                                                         
                                                                                                                         **Headers returned**:
                                                                                                                         - `Link`: Contains links to next page
                                                                                                                         - - `X-Total-Count`: Total number of items
                                                                                                                          
                                                                                                                           - For Poke automations, implement loop logic to handle pagination.
                                                                                                                          
                                                                                                                           - ## Troubleshooting
                                                                                                                          
                                                                                                                           - ### 401 Unauthorized
                                                                                                                           - - Token may be expired
                                                                                                                             - - Token format incorrect
                                                                                                                               - - Token was revoked in Canvas Settings
                                                                                                                                
                                                                                                                                 - ### 403 Forbidden
                                                                                                                                 - - Token doesn't have necessary permissions
                                                                                                                                   - - User doesn't have access to that course/assignment
                                                                                                                                    
                                                                                                                                     - ### 404 Not Found
                                                                                                                                     - - Course ID or assignment ID is incorrect
                                                                                                                                       - - Resource doesn't exist
                                                                                                                                        
                                                                                                                                         - ### Rate Limiting
                                                                                                                                         - Canvas has rate limits. If you hit them:
                                                                                                                                         - - Implement exponential backoff
                                                                                                                                           - - Cache results when possible
                                                                                                                                             - - Stagger requests in automations
                                                                                                                                              
                                                                                                                                               - ## References
                                                                                                                                              
                                                                                                                                               - - Canvas API Documentation: https://canvas.instructure.com/doc/api/
                                                                                                                                                 - - Canvas REST API Guide: https://canvas.instructure.com/doc/api/basics.html
                                                                                                                                                   - - Poke Documentation: https://poke.com/docs
                                                                                                                                                    
                                                                                                                                                     - ## Future Enhancements
                                                                                                                                                    
                                                                                                                                                     - - [ ] Full MCP server wrapper (requires persistent hosting)
                                                                                                                                                       - [ ] - [ ] OAuth flow support (for Google accounts without institutional restrictions)
                                                                                                                                                       - [ ] - [ ] Webhook integration for real-time updates
                                                                                                                                                       - [ ] - [ ] Grade tracking automations
                                                                                                                                                       - [ ] - [ ] Submission status notifications
                                                                                                                                                      
                                                                                                                                                       - [ ] ## Support
                                                                                                                                                      
                                                                                                                                                       - [ ] For issues or questions about this integration:
                                                                                                                                                       - [ ] 1. Check Canvas API docs for endpoint details
                                                                                                                                                       - [ ] 2. Verify your token is valid and not expired
                                                                                                                                                       - [ ] 3. Test API calls with curl before using in Poke
                                                                                                                                                       - [ ] 4. Review Poke automation documentation
