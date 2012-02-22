/*
 Licensed to the Apache Software Foundation (ASF) under one
 or more contributor license agreements.  See the NOTICE file
 distributed with this work for additional information
 regarding copyright ownership.  The ASF licenses this file
 to you under the Apache License, Version 2.0 (the
 "License"); you may not use this file except in compliance
 with the License.  You may obtain a copy of the License at
 
 http://www.apache.org/licenses/LICENSE-2.0
 
 Unless required by applicable law or agreed to in writing,
 software distributed under the License is distributed on an
 "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 KIND, either express or implied.  See the License for the
 specific language governing permissions and limitations
 under the License.
 */

#define __CORDOVA_0_9_6  00906
#define __CORDOVA_1_0_0  10000
#define __CORDOVA_1_1_0  10100
#define __CORDOVA_1_2_0  10200
#define __CORDOVA_1_3_0  10300
#define __CORDOVA_1_4_0  10400
#define __CORDOVA_1_4_1  10401
#define __CORDOVA_1_5_0  10500
#define __CORDOVA_NA     99999  /* not available */


/*
 #if CORDOVA_VERSION_MIN_REQUIRED >= __CORDOVA_1_5_0
    // do something when its at least 1.5.0
 #else
    // do something else (non 1.5.0)
 #endif
 */
#ifndef CORDOVA_VERSION_MIN_REQUIRED
    #define CORDOVA_VERSION_MIN_REQUIRED __CORDOVA_1_5_0
#endif
