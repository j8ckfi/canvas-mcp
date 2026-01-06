# Poke Automation Examples for Canvas

This document provides practical examples for using Canvas API with Poke automations.

## Token Reference

Your Canvas API Token:
```
17740~C7Xz3AHmmFUN8PDJuQ3XGtQNfPP73UAY2LuU7aKQecKyW2Bv2ex7TxxFay9vx9VD
```

**Expires:** May 6, 2026

## Example 1: Daily Course Announcements Digest

**Goal:** Get a text message each morning with all new announcements from your courses.

### Setup in Poke

1. Create a new automation
2. 2. Trigger: **Schedule** → 8:00 AM daily
   3. 3. Actions:
     
      4. ```
         Step 1: Fetch Active Courses
           Method: GET
           URL: https://jajags.instructure.com/api/v1/courses?enrollment_state=active
           Header: Authorization: Bearer 17740~C7Xz3AHmmFUN8PDJuQ3XGtQNfPP73UAY2LuU7aKQecKyW2Bv2ex7TxxFay9vx9VD

         Step 2: For Each Course, Get Announcements
           Method: GET
           URL: https://jajags.instructure.com/api/v1/courses/{course_id}/discussion_topics?only_announcements=true

         Step 3: Format Results
           Create a summary message with:
           - Course name
           - Announcement title
           - Announcement date

         Step 4: Send Text
           Action: Text Poke
           Message: Your Daily Canvas Digest
           Body: [Formatted announcements from Step 3]
         ```

         ### Sample Response

         ```json
         {
           "id": 12345,
           "name": "Introduction to Biology",
           "course_code": "BIO101",
           "enrollments": [
             {
               "type": "StudentEnrollment",
               "role": "StudentEnrollment"
             }
           ]
         }
         ```

         ## Example 2: Assignment Deadline Reminders

         **Goal:** Get notified 24 hours before assignments are due.

         ### Setup in Poke

         1. Create automation
         2. 2. Trigger: **Schedule** → Daily at 9:00 AM
            3. 3. Actions:
              
               4. ```
                  Step 1: Get All Courses
                    GET /api/v1/courses?enrollment_state=active

                  Step 2: Get Assignments (for each course)
                    GET /api/v1/courses/{id}/assignments?include[]=submission

                  Step 3: Filter Upcoming Assignments
                    - due_at is within 24 hours
                    - submission_types includes != 'none'

                  Step 4: Send Reminders
                    For each due assignment:
                    - Text: "REMINDER: {assignment_name} due tomorrow in {course_name}"
                    - Time: 9:00 AM
                  ```

                  ### Canvas Assignment Endpoint Response

                  ```json
                  [
                    {
                      "id": 567890,
                      "name": "Essay 1: Biology Report",
                      "description": "<p>Write a 5-page report...</p>",
                      "due_at": "2026-01-15T23:59:59Z",
                      "points_possible": 100,
                      "submission_types": ["online_text_entry", "online_upload"],
                      "course_id": 12345
                    }
                  ]
                  ```

                  ## Example 3: Grade Tracking

                  **Goal:** Check your grades in specific courses weekly.

                  ### Setup in Poke

                  ```
                  Trigger: Every Friday at 5 PM

                  Step 1: Get User ID
                    GET /api/v1/users/self
                    Store: user_id from response

                  Step 2: Get Course Enrollments
                    GET /api/v1/courses/{course_id}/enrollments?user_id={user_id}&include[]=grades

                  Step 3: Extract Current Grade
                    Current grade in response: enrollments[0].grades.current_score

                  Step 4: Format and Send
                    Text message with:
                    - Course name
                    - Current grade percentage
                    - Letter grade
                  ```

                  ### Sample Data

                  ```json
                  {
                    "user_id": 999,
                    "id": 1111,
                    "grades": {
                      "html_url": "https://jajags.instructure.com/courses/12345/grades",
                      "current_score": 87.5,
                      "current_grade": "B+",
                      "final_score": 87.5,
                      "final_grade": "B+"
                    }
                  }
                  ```

                  ## Example 4: New Submission Notifications

                  **Goal:** Get notified when you submit an assignment.

                  ### Setup in Poke

                  ```
                  Trigger: Manual trigger (run after you submit)

                  Step 1: Get Recent Submissions
                    GET /api/v1/courses/{course_id}/assignments/{assignment_id}/submissions/{user_id}

                  Step 2: Check Submission Status
                    submitted_at != null

                  Step 3: Send Confirmation
                    Text: "✓ Assignment '{name}' submitted successfully at {time}"
                  ```

                  ## Example 5: Course Content Overview

                  **Goal:** Get a weekly summary of your course content.

                  ### Poke Automation

                  ```
                  Trigger: Every Monday at 7 AM

                  For each enrolled course:
                    1. GET /api/v1/courses/{id} - Get course details
                    2. GET /api/v1/courses/{id}/modules - Get all modules
                    3. GET /api/v1/courses/{id}/assignments - Get all assignments
                    4. GET /api/v1/courses/{id}/discussion_topics - Get discussions

                  Compile into message:
                    Weekly Course Overview:
                    - Active Courses: [list]
                    - New Assignments This Week: [list]
                    - Discussions to Catch Up: [count]
                    - Modules Assigned: [list]

                  Send via Text Poke
                  ```

                  ## Authentication Format

                  All requests use Bearer token format:

                  ```
                  Authorization: Bearer 17740~C7Xz3AHmmFUN8PDJuQ3XGtQNfPP73UAY2LuU7aKQecKyW2Bv2ex7TxxFay9vx9VD
                  ```

                  ## Testing with curl

                  Before setting up in Poke, test with curl:

                  ```bash
                  # Test 1: Get yourself
                  curl -H "Authorization: Bearer YOUR_TOKEN" \
                    https://jajags.instructure.com/api/v1/users/self

                  # Test 2: Get courses
                  curl -H "Authorization: Bearer YOUR_TOKEN" \
                    https://jajags.instructure.com/api/v1/courses?enrollment_state=active

                  # Test 3: Get specific course (replace 12345)
                  curl -H "Authorization: Bearer YOUR_TOKEN" \
                    https://jajags.instructure.com/api/v1/courses/12345

                  # Test 4: Get assignments (replace 12345)
                  curl -H "Authorization: Bearer YOUR_TOKEN" \
                    https://jajags.instructure.com/api/v1/courses/12345/assignments
                  ```

                  ## Finding IDs

                  To use the API, you need course and assignment IDs:

                  ### Find Course ID
                  1. Go to your course on Canvas
                  2. 2. URL will be: `https://jajags.instructure.com/courses/12345`
                     3. 3. The number is your course_id
                       
                        4. ### Find Assignment ID
                        5. 1. Open an assignment
                           2. 2. URL: `https://jajags.instructure.com/courses/12345/assignments/67890`
                              3. 3. Second number is assignment_id
                                
                                 4. ## Poke Limitations & Workarounds
                                
                                 5. ### Limitation: JSON Parsing
                                 6. Poke may have limited JSON parsing. Workaround:
                                 7. - Use simple text extraction from API responses
                                    - - Focus on key fields you need
                                      - - Test response parsing before relying on it
                                       
                                        - ### Limitation: Loops
                                        - Poke may not support loops over API results. Workaround:
                                        - - Create separate automations for each course
                                          - - Use Poke's manual trigger to run for specific courses
                                            - - Ask Poke agent to help parse multiple results
                                             
                                              - ### Limitation: Scheduled Delays
                                              - If automations run too frequently, add delays:
                                              - - Schedule main digest at 8:00 AM
                                                - - Schedule supplementary checks at 2:00 PM
                                                  - - Avoid running every hour
                                                   
                                                    - ## Security Reminders
                                                   
                                                    - ⚠️ **Important**:
                                                    - - Never share your token
                                                      - - Don't commit the token to public repos
                                                        - - Regenerate token if you suspect compromise
                                                          - - The token will expire May 6, 2026 - set a reminder to regenerate
                                                            - - Store token only in Poke's secure settings
                                                             
                                                              - ## Debugging
                                                             
                                                              - If automations aren't working:
                                                             
                                                              - ### Check 1: Test the API Endpoint
                                                              - Use curl to verify the endpoint works before adding to Poke
                                                             
                                                              - ### Check 2: Verify Token
                                                              - Make sure token is correct and not expired
                                                             
                                                              - ### Check 3: Check Course/Assignment IDs
                                                              - Verify IDs are correct and you have access
                                                             
                                                              - ### Check 4: Check Headers
                                                              - Ensure `Authorization: Bearer {TOKEN}` format is exact
                                                             
                                                              - ### Check 5: Test in Poke
                                                              - Use Poke's "Test" feature to run automation manually and check errors
                                                             
                                                              - ## Canvas API Documentation
                                                             
                                                              - For more endpoints and details:
                                                              - - Full Canvas API Docs: https://canvas.instructure.com/doc/api/
                                                                - - Discussion Topics: https://canvas.instructure.com/doc/api/discussion_topics.html
                                                                  - - Assignments: https://canvas.instructure.com/doc/api/assignments.html
                                                                    - - Enrollments: https://canvas.instructure.com/doc/api/enrollments.html
                                                                      - - Submissions: https://canvas.instructure.com/doc/api/submissions.html
                                                                       
                                                                        - ## Questions?
                                                                       
                                                                        - If you have issues:
                                                                        - 1. Verify your Canvas token is valid
                                                                          2. 2. Test endpoint with curl first
                                                                             3. 3. Check token hasn't expired
                                                                                4. 4. Review Canvas API docs for endpoint details
                                                                                   5. 5. Check Poke documentation for automation syntax
