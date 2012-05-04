<!--
#
# Licensed to the Apache Software Foundation (ASF) under one
# or more contributor license agreements.  See the NOTICE file
# distributed with this work for additional information
# regarding copyright ownership.  The ASF licenses this file
# to you under the Apache License, Version 2.0 (the
# "License"); you may not use this file except in compliance
# with the License.  You may obtain a copy of the License at
# 
# http://www.apache.org/licenses/LICENSE-2.0
# 
# Unless required by applicable law or agreed to in writing,
# software distributed under the License is distributed on an
# "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
#  KIND, either express or implied.  See the License for the
# specific language governing permissions and limitations
# under the License.
#
-->

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
       
9. Run [Apache Rat](http://incubator.apache.org/rat/index.html) on **/bin/templates/project**, and add the Apache License header on affected files
10. Check your modified and new project files in to Git, and push it upstream
