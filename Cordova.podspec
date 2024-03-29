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

require "json"

packageJson = JSON.parse(File.read(File.join(__dir__, "package.json")))
relVersion = packageJson['version']
relSource  = { :git => "https://github.com/apache/cordova-ios.git",
            :tag => "rel/#{relVersion}",
            :submodules => true }

Pod::Spec.new do |s|
  s.name                = "Cordova"
  s.version             = relVersion
  s.summary             = "Apache Cordova for iOS"
  s.homepage            = "https://github.com/apache/cordova-ios"
  s.license             = { :type => "Apache 2.0", :file => "LICENSE" }
  s.author              = "Apache Software Foundation"
  s.platform            = :ios, "11.0"
  s.source              = relSource
  s.requires_arc        = true
  s.frameworks          = 'Foundation'
  s.source_files        = 'CordovaLib/**/*.{h,m}'
  s.public_header_files = 'CordovaLib/include/**/*.h'
end

#
# ATTENTION: 
#
# This file needs to be updated manually whenever a Cordova upgrade that bumps up min version of iOS is performed.
# The release version number and the list of public headers are automatically updated through scipts.
# Sections that need to be updated:
#   1. {s.platform} should be updated if the minimum version of iOS has changed.
#
