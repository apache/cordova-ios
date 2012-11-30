#!/usr/bin/python
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
"""
Converts a Cordova.plist file into a config.xml file.

Usage:
  plist2xml.py Cordova.plist > config.xml
"""

import plistlib
import StringIO
import sys
from xml.dom import minidom
from xml.etree import ElementTree


def Usage():
  sys.stderr.write(__doc__)
  sys.exit(1)


def ValueToElement(node_name, key, value):
  if isinstance(value, bool):
    value = str(value).lower()
  return ElementTree.Element(node_name, attrib={'name':key, 'value':str(value)})


def AppendDict(d, node, name, ignore=()):
  for key in sorted(d):
    if key not in ignore:
      node.append(ValueToElement(name, key, d[key]))


def main(argv):
  if len(argv) != 1:
    Usage();

  plist = plistlib.readPlist(argv[0])
  root = ElementTree.Element('cordova')

  AppendDict(plist, root, 'preference', ignore=('Plugins', 'ExternalHosts'))

  plugins = ElementTree.Element('plugins')
  root.append(plugins)
  AppendDict(plist['Plugins'], plugins, 'plugin')

  for value in sorted(plist['ExternalHosts']):
    root.append(ElementTree.Element('access', attrib={'origin':value}))

  tree = ElementTree.ElementTree(root)
  s = StringIO.StringIO()
  tree.write(s, encoding='UTF-8')
  mini_dom = minidom.parseString(s.getvalue())
  sys.stdout.write(mini_dom.toprettyxml(encoding='UTF-8'))


if __name__ == '__main__':
  main(sys.argv[1:])
