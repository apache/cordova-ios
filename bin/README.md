Updating the template project
-----------------------------

1. In Xcode 4, create a new "Cordova-based Application"
2. For **Product Name**, set it to **"\_\_TESTING\_\_"** (two underscores on each side)
3. For **Company Identifier**, set it to **"--ID--"** (two dashes on each side)
4. Create the project
5. Run it once, find the **"www"** folder and add it as a **Folder Reference** to the project
6. Close the project
7. Delete these folders and files:

        bin/templates/project/__TESTING__
        bin/templates/project/www
        bin/templates/project/__TESTING__.xcodeproj

8. Inside the project folder from the project you created above, copy these folders and files to your **bin/templates/project**:

       __TESTING__
       www
       __TESTING__.xcodeproj
       
9. Check your modified and new project files in to Git, and push it upstream
