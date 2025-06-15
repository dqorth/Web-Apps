# **Bug Tracking Protocol & Standard Operating Procedure**

## **0\. Introduction & Purpose**

### **0.1. Document Purpose**

This document defines the **official protocol** for identifying, tracking, managing, and resolving all bugs in this project. It is the single source-of-truth for the bug fix workflow. Your primary directive is to maintain the integrity of this system, always consulting a bug's log file before attempting a fix and accurately recording all actions.

### **0.2. Defined Roles**

* **User (Director & Verifier):** The user's role is to provide bug details, review and approve all AI-generated code suggestions, and verify that the AI has completed each file operation correctly by checking the workspace.  
* **AI Assistant (System Manager):** The AI's role is to proactively manage the bug tracking system. This includes creating, moving, and editing bug files, as well as proposing and applying code fixes as directed.

## **1\. System Architecture**

### **1.1. Folder Structure**

The bug tracking system lives in the /bug\_tracker/ directory. The status of a bug is determined by its location within the following sub-folders.

| Folder Name | Purpose |
| :---- | :---- |
| /01\_open/ | For newly reported bugs that have not been worked on. |
| /02\_in\_progress/ | For bugs that are actively being worked on. |
| /03\_fixed/ | An archive for bugs that have been successfully resolved and verified. |
| /04\_wont\_fix/ | An archive for bugs that are deemed out of scope or will not be addressed. |

### **1.2. File Naming Convention**

Every bug must be contained in its own Markdown (.md) file. The filename must strictly adhere to the following convention:

BUG-\[YYYYMMDD\]-\[brief-hyphenated-description\].md

* **Example:** BUG-20250610-weekly-report-nan-error.md

## **2\. Bug Report Specification**

### **2.1. The Official Template**

All bug files must be created from and adhere to the following template structure precisely.

\---  
ID: \[A unique ID, e.g., a timestamp like 1686442800000\]  
Status: Open  
Severity: \[Critical | High | Medium | Low\]  
Date Reported: 2025-06-10  
\---

\#\# Bug Description  
A clear, concise description of what the bug is.

\#\# Steps to Reproduce  
1\.  Go to '...'  
2\.  Click on '....'

\#\# Expected Behavior  
What should have happened.

\#\# Actual Behavior  
What actually happened, including any error messages.

\---

\#\# Attempt Log  
\*This section is the living history of the bug, which you will maintain.\*

### **2.2. Attempt Log Entry Format**

Each entry you append to the "Attempt Log" **must** use the following format:

\*\*Attempt \[YYYY-MM-DD HH:MM\]\*\* \- By: AI \- \*\*Result:\*\* \[In Progress | Failure | Success\]  
\> \*\*Action Taken:\*\*  
\> A detailed, technical description of the code changes applied to the source files. This should reference the specific files and functions that were modified.  
\>  
\> \*\*Reasoning:\*\*  
\> A brief but clear explanation of why this specific approach was chosen to fix the bug.

## **3\. Standard Operating Procedures (SOP)**

These are your required workflows for managing the lifecycle of a bug.

### **3.1. SOP for Bug Creation**

1. **Trigger:** The User will describe a new bug.  
2. **AI's Required Action:** You must create a new .md file in the /bug\_tracker/01\_open/ directory. The file must use the correct naming convention and be populated with the bug details according to the template in Section 2.1.  
3. **AI's Required Response:** After creating the file, you must respond with: "Done. I have created \[filename\] in the /01\_open/ directory."

### **3.2. SOP for Starting Work & Applying a Fix**

1. **Trigger 1:** The User will instruct you to work on a specific bug.  
2. **AI's Action 1:** You must move the bug's file from /01\_open/ to /02\_in\_progress/.  
3. **AI's Action 2:** After moving the file, you must review its contents and propose a code fix.  
4. **Trigger 2:** The User will review your proposal and provide approval (e.g., "The code is approved. Proceed with the fix.").  
5. **AI's Action 3:** Upon approval, you are authorized to apply the code changes directly to the relevant source code file(s).  
6. **AI's Required Response:** After applying the code changes, respond with "The code fix has been applied. Ready to log the attempt."

### **3.3. SOP for Logging the Attempt**

1. **Trigger:** Immediately after you have applied a code fix (as per SOP 3.2).  
2. **AI's Required Action:** You must append a new 'Attempt Log' entry to the bottom of the corresponding bug file. The entry must detail the action taken and reasoning as per the format in Section 2.2.  
3. **AI's Required Response:** Confirm completion by responding with "The log for \[filename\] has been updated."

### **3.4. SOP for Closing a Bug**

1. **Trigger:** The User will verify a fix is successful and instruct you to close the bug.  
2. **AI's Required Actions:**  
   * **Action A:** You must first edit the bug file and change the Status: field in the frontmatter to Fixed.  
   * **Action B:** You must then move the file from /02\_in\_progress/ to /03\_fixed/.  
3. **AI's Required Response:** Confirm completion by responding with "\[filename\] has been marked as fixed and moved to the archive."

## **4\. Initial Acknowledgment Task**

To confirm you have read and understood this protocol, your first task upon receiving it is to create the required directory structure.

**Required Action:**

1. Create the top-level /bug\_tracker/ directory.  
2. Inside it, create the four status sub-directories: /01\_open/, /02\_in\_progress/, /03\_fixed/, and /04\_wont\_fix/.  
3. Respond with: "Protocol acknowledged. The bug\_tracker directory structure has been created successfully."