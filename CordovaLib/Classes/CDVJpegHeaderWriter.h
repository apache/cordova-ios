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

//
//  CDVImageHeaderWriter.h
//  CordovaLib
//
//  Created by Lorin Beer on 2012-10-02.
//
//

#import <Foundation/Foundation.h>

@interface CDVJpegHeaderWriter : NSObject {
    NSDictionary * SubIFDTagFormatDict;
    NSDictionary * IFD0TagFormatDict;
}

- (void) readExifMetaData : (NSData*) imgdata;
- (void) insertExifMetaData : (NSData*) imgdata: (NSDictionary*) exifdata;
- (void) locateExifMetaData : (NSData*) imgdata;
/**
 * creates an IFD field
 * Bytes 0-1 Tag code
 * Bytes 2-3 Data type
 * Bytes 4-7 Count, number of elements of the given data type
 * Bytes 8-11 Value/Offset
 */

- (NSString*) createExifAPP1 : (NSDictionary*) datadict;

- (void) createExifDataString : (NSDictionary*) datadict;

- (NSString*) createDataElement : (NSString*) element
              withElementData: (NSString*) data
              withExternalDataBlock: (NSDictionary*) memblock;

- (NSString*) decimalToUnsignedRational: (NSNumber *) numb
         outputNumerator: (NSNumber *) num
         outputDenominator: (NSNumber*) deno;


- (NSString*) hexStringFromData : (NSData*) data;

- (NSNumber*) numericFromHexString : (NSString *) hexstring;

@end
