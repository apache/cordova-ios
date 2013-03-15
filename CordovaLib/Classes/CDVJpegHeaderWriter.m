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
//  CDVImageHeaderWriter.m
//  CordovaLib
//
//  Created by Lorin Beer on 2012-10-02.
//
//

#import "CDVJpegHeaderWriter.h"
#include "CDVExif.h"

#define IntWrap(x) [NSNumber numberWithInt:x]

// tag info shorthand, tagno: tag number, typecode: data type:, components: number of components
#define TAGINF(tagno, typecode, components) [NSArray arrayWithObjects: tagno, typecode, components, nil]


const uint mJpegId = 0xffd8; // JPEG format marker
const uint mExifMarker = 0xffe1; // APP1 jpeg header marker
const uint mExif = 0x45786966; // ASCII 'Exif', first characters of valid exif header after size
const uint mMotorallaByteAlign = 0x4d4d; // 'MM', motorola byte align, msb first or 'sane'
const uint mIntelByteAlgin = 0x4949; // 'II', Intel byte align, lsb first or 'batshit crazy reverso world'
const uint mTiffLength = 0x2a; // after byte align bits, next to bits are 0x002a(MM) or 0x2a00(II), tiff version number


@implementation CDVJpegHeaderWriter

- (id) init {    
    // supported tags for exif IFD
    IFD0TagFormatDict = [[NSDictionary alloc] initWithObjectsAndKeys:
                  //      TAGINF(@"010e", [NSNumber numberWithInt:EDT_ASCII_STRING], @0), @"ImageDescription",
                        TAGINF(@"0132", [NSNumber numberWithInt:EDT_ASCII_STRING], @20), @"DateTime",
                        TAGINF(@"010f", [NSNumber numberWithInt:EDT_ASCII_STRING], @0), @"Make",
                        TAGINF(@"0110", [NSNumber numberWithInt:EDT_ASCII_STRING], @0), @"Model",
                        TAGINF(@"0131", [NSNumber numberWithInt:EDT_ASCII_STRING], @0), @"Software",
                        TAGINF(@"011a", [NSNumber numberWithInt:EDT_URATIONAL], @1), @"XResolution",
                        TAGINF(@"011b", [NSNumber numberWithInt:EDT_URATIONAL], @1), @"YResolution",
                        // currently supplied outside of Exif data block by UIImagePickerControllerMediaMetadata, this is set manually in CDVCamera.m
                        TAGINF(@"0112", [NSNumber numberWithInt:EDT_USHORT], @1), @"Orientation",
                       
                        // rest of the tags are supported by exif spec, but are not specified by UIImagePickerControllerMediaMedadata
                        // should camera hardware supply these values in future versions, or if they can be derived, ImageHeaderWriter will include them gracefully
                        TAGINF(@"0128", [NSNumber numberWithInt:EDT_USHORT], @1), @"ResolutionUnit",
                        TAGINF(@"013e", [NSNumber numberWithInt:EDT_URATIONAL], @2), @"WhitePoint",
                        TAGINF(@"013f", [NSNumber numberWithInt:EDT_URATIONAL], @6), @"PrimaryChromaticities",
                        TAGINF(@"0211", [NSNumber numberWithInt:EDT_URATIONAL], @3), @"YCbCrCoefficients",
                        TAGINF(@"0213", [NSNumber numberWithInt:EDT_USHORT], @1), @"YCbCrPositioning",
                        TAGINF(@"0214", [NSNumber numberWithInt:EDT_URATIONAL], @6), @"ReferenceBlackWhite",
                        TAGINF(@"8298", [NSNumber numberWithInt:EDT_URATIONAL], @0), @"Copyright",
                         
                        // offset to exif subifd, we determine this dynamically based on the size of the main exif IFD
                        TAGINF(@"8769", [NSNumber numberWithInt:EDT_ULONG], @1), @"ExifOffset",
                        nil];

    // supported tages for exif subIFD
    SubIFDTagFormatDict = [[NSDictionary alloc] initWithObjectsAndKeys:
                        TAGINF(@"829a", [NSNumber numberWithInt:EDT_URATIONAL], @1), @"ExposureTime",
                        TAGINF(@"829d", [NSNumber numberWithInt:EDT_URATIONAL], @1), @"FNumber",
                        TAGINF(@"8822", [NSNumber numberWithInt:EDT_USHORT], @1), @"ExposureProgram",
                        TAGINF(@"8827", [NSNumber numberWithInt:EDT_USHORT], @2), @"ISOSpeedRatings",
                          // TAGINF(@"9000", [NSNumber numberWithInt:], @), @"ExifVersion",
                          TAGINF(@"9004",[NSNumber numberWithInt:EDT_ASCII_STRING],@20), @"DateTimeDigitized",
                          TAGINF(@"9003",[NSNumber numberWithInt:EDT_ASCII_STRING],@20), @"DateTimeOriginal",
                          TAGINF(@"9207", [NSNumber numberWithInt:EDT_USHORT], @1), @"MeteringMode",
                          TAGINF(@"9209", [NSNumber numberWithInt:EDT_USHORT], @1), @"Flash",
                          TAGINF(@"920a", [NSNumber numberWithInt:EDT_URATIONAL], @1), @"FocalLength",
                          TAGINF(@"920a", [NSNumber numberWithInt:EDT_URATIONAL], @1), @"FocalLength",
                //      TAGINF(@"9202",[NSNumber numberWithInt:EDT_URATIONAL],@1), @"ApertureValue",
                //      TAGINF(@"9203",[NSNumber numberWithInt:EDT_SRATIONAL],@1), @"BrightnessValue",
                         TAGINF(@"a001",[NSNumber numberWithInt:EDT_USHORT],@1), @"ColorSpace",
                         TAGINF(@"8822", [NSNumber numberWithInt:EDT_USHORT], @1), @"ExposureProgram",
        //              @"PixelXDimension", [[NSDictionary alloc] initWithObjectsAndKeys: @"code", @"a002", nil],
        //              @"PixelYDimension", [[NSDictionary alloc] initWithObjectsAndKeys: @"code", @"a003", nil],
        //              @"SceneType", [[NSDictionary alloc] initWithObjectsAndKeys: @"code", @"a301", nil],
        //              @"SensingMethod", [[NSDictionary alloc] initWithObjectsAndKeys: @"code", @"a217", nil],
        //              @"Sharpness", [[NSDictionary alloc] initWithObjectsAndKeys: @"code", @"a40A", nil],
                    // TAGINF(@"9201", [NSNumber numberWithInt:EDT_SRATIONAL], @1), @"ShutterSpeedValue",
        //              @"WhiteBalance", [[NSDictionary alloc] initWithObjectsAndKeys: @"code", @"a403", nil],
                      nil];
    return self;
}

/**
 * Create the Exif data block as a hex string
 *   jpeg uses Application Markers (APP's) as markers for application data
 *   APP1 is the application marker reserved for exif data
 *
 *   (NSDictionary*) datadict - with subdictionaries marked '{TIFF}' and '{EXIF}' as returned by imagePickerController with a valid
 *                              didFinishPickingMediaWithInfo data dict, under key @"UIImagePickerControllerMediaMetadata"
 *
 *   the following constructs a hex string to Exif specifications, and is therefore brittle
 *   altering the order of arguments to the string constructors, modifying field sizes or formats,
  *  and any other minor change will likely prevent the exif data from being read
 */
- (NSString*) createExifAPP1 : (NSDictionary*) datadict {
    NSMutableString * app1; // holds finalized product
    NSString * exifIFD; // exif information file directory
    NSString * subExifIFD; // subexif information file directory
    
    // FFE1 is the hex APP1 marker code, and will allow client apps to read the data
    NSString * app1marker = @"ffe1";
    // SSSS size, to be determined
    // EXIF ascii characters followed by 2bytes of zeros
    NSString * exifmarker = @"457869660000";
    // Tiff header: 4d4d is motorolla byte align (big endian), 002a is hex for 42
    NSString * tiffheader = @"4d4d002a";
    //first IFD offset from the Tiff header to IFD0. Since we are writing it, we know it's address 0x08
    NSString * ifd0offset = @"00000008";
    
    //data labeled as TIFF in UIImagePickerControllerMediaMetaData is part of the EXIF IFD0 portion of APP1
    exifIFD = [self createExifIFDFromDict: [datadict objectForKey:@"{TIFF}"] withFormatDict: IFD0TagFormatDict isIFD0:YES];

    //data labeled as EXIF in UIImagePickerControllerMediaMetaData is part of the EXIF Sub IFD portion of APP1
    subExifIFD = [self createExifIFDFromDict: [datadict objectForKey:@"{Exif}"] withFormatDict: SubIFDTagFormatDict isIFD0:NO];
  /*  app1 = [[NSString alloc] initWithFormat:@"%@%04x%@%@%@%@",
                app1marker,
                ([exif length]/2)+16,
                exifmarker,
                tiffheader,
                ifd0offset,
                exif];
    
    NSLog(@"%@",app1);*/
    
    /*
     * constructing app1 segment:
     * 2 byte marker: ffe1
     * 2 byte size  : app1 size
     * 6 byte exif marker : ascii string 'exif' followed by two bytes of zeroes
     */
    /*
    app1 = [[[NSMutableString alloc] initWithFormat: @"%@%04x%@%@%@%@%@",
            app1marker,
            16+[exifIFD length]/2+[subExifIFD length]/2,
            exifmarker,
            tiffheader,
            ifd0offset,
            exifIFD,
            subExifIFD];
*/
    NSLog(@"%@ \n %d",subExifIFD,[subExifIFD length]);
    

    app1 = [[NSMutableString alloc] initWithFormat: @"%@%04x%@%@%@%@",
            app1marker,
            16+[exifIFD length]/2 /*+[subExifIFD length]/2*/,
            exifmarker,
            tiffheader,
            ifd0offset,
            exifIFD];
    
    NSLog(@"%@",app1);
    
    return app1;
}

/**
 * returns hex string representing a valid exif information file directory constructed from the datadict and formatdict
 * datadict exif data entries encode into ifd
 * formatdict specifies format of data entries and allowed entries in this ifd
 */
- (NSString*) createExifIFDFromDict : (NSDictionary*) datadict withFormatDict : (NSDictionary*) formatdict isIFD0 : (BOOL) ifd0flag {
    NSArray * datakeys = [datadict allKeys];
    NSArray * knownkeys = [formatdict  allKeys]; // only keys in knowkeys are considered for entry in this IFD
    NSMutableArray * ifdblock = [[NSMutableArray alloc] initWithCapacity: [datadict count]];
    NSMutableArray * ifddatablock = [[NSMutableArray alloc] initWithCapacity: [datadict count]];
    ifd0flag = NO;
    
    NSLog(@"%@",[datadict description]);

    
    for (int i = 0; i < [datakeys count]; i++) {
        NSString * key = [datakeys objectAtIndex:i];
        if ([knownkeys indexOfObject: key] != NSNotFound) {
            // create new IFD entry
            NSString * entry = [self  createIFDElement: key
                                      withFormatDict: formatdict
                                      withElementData: [datadict objectForKey:key]];
            
            NSString * data = [self createIFDElementDataWithFormat: [formatdict objectForKey:key]
                                                   withData: [datadict objectForKey:key]];
            NSLog(@"%@ %@",entry, data);
            if (entry) {
                [ifdblock addObject:entry];
                if(!data) {
                    [ifdblock addObject:@""];
                } else {
                    [ifddatablock addObject:data];
                }
            }
        }
    }
    //[ifdblock addObject: [[NSString alloc] initWithFormat:@"8769%@%@", @"0004",@"00000001"]];
    NSMutableString * exifstr = [[NSMutableString alloc] initWithCapacity: [ifdblock count] * 24];
    NSMutableString * dbstr = [[NSMutableString alloc] initWithCapacity: 100];
    
    // calculate the starting address of the idf data block based on number 
    int addr=0;
    if (ifd0flag) {
        // +1 for tag 0x8769, exifsubifd offset
        addr = 14+(12*([ifddatablock count]+1));
    } else {
        addr = 14+12*[ifddatablock count];
    }
    
    for (int i = 0; i < [ifdblock count]; i++) {

        NSString * entry = [ifdblock objectAtIndex:i];
        NSString * data = [ifddatablock objectAtIndex:i];
        
        NSLog(@"entry: %@ entry:%@", entry, data);
        NSLog(@"%d",addr);
        // check if the data fits into 4 bytes
        if( [data length] <= 8) {
            // concatenate the entry and the (4byte) data entry into the final IFD entry and append to exif ifd string
            NSLog(@"%@   %@", entry, data);
            [exifstr appendFormat : @"%@%@", entry, data];
        } else {
            [exifstr appendFormat : @"%@%08x", entry, addr];
            [dbstr appendFormat: @"%@", data]; 
            addr+= [data length] / 2;
        }
    }
    
    // calculate IFD0 terminal offset tags, currently ExifSubIFD
    int entrycount = [ifdblock count];
    if (ifd0flag) {
        NSNumber * offset = [NSNumber numberWithInt:[exifstr length] / 2 + [dbstr length] / 2 ];
        
        [self appendExifOffsetTagTo: exifstr
                        withOffset : offset];
        entrycount++;
    } 
    return [[NSString alloc] initWithFormat: @"%04x%@%@%@",
            entrycount,
            exifstr,
            @"00000000",
            dbstr];
}


/**
 * Creates an exif formatted exif information file directory entry
 */
- (NSString*) createIFDElement: (NSString*) elementName withFormatDict : (NSDictionary*) formatdict withElementData : (NSString*) data  {
    NSArray * fielddata = [formatdict objectForKey: elementName];// format data of desired field
    NSLog(@"%@", [data description]);
    if (fielddata) {
        // format string @"%@%@%@%@", tag number, data format, components, value
        NSNumber * dataformat = [fielddata objectAtIndex:1];
        NSNumber * components = [fielddata objectAtIndex:2];
        if([components intValue] == 0) {
            components = [NSNumber numberWithInt: [data length] * DataTypeToWidth[[dataformat intValue]-1]];            
        }

        return [[NSString alloc] initWithFormat: @"%@%@%08x",
                                                [fielddata objectAtIndex:0], // the field code
                                                [self formatWithLeadingZeroes: @4 :dataformat], // the data type code
                                                [components intValue]]; // number of components
    }
    return NULL;
}

/**
 * appends exif IFD0 tag 8769 "ExifOffset" to the string provided
 * (NSMutableString*) str - string you wish to append the 8769 tag to: APP1 or IFD0 hex data string 
 *  //  TAGINF(@"8769", [NSNumber numberWithInt:EDT_ULONG], @1), @"ExifOffset",
 */
- (void) appendExifOffsetTagTo: (NSMutableString*) str withOffset : (NSNumber*) offset {
    NSArray * format = TAGINF(@"8769", [NSNumber numberWithInt:EDT_ULONG], @1);
    
    NSString * entry = [self  createIFDElement: @"ExifOffset"
                                withFormatDict: IFD0TagFormatDict
                               withElementData: [offset stringValue]];
    
    NSString * data = [self createIFDElementDataWithFormat: format
                                                  withData: [offset stringValue]];
    [str appendFormat:@"%@%@", entry, data];
}

/*

- (void) createTagDataHelper: (NSString *) tagname withTagCode: (NSInteger) tagcode {
    NSMutableString * datastr = [NSMutableString alloc];
    [datastr appendFormat: @"%@, tagcode", tagname];
}
*/



/**
 * formatIFHElementData
 * formats the Information File Directory Data to exif format
 * @return formatted data string
 */
- (NSString*) createIFDElementDataWithFormat: (NSArray*) dataformat withData: (NSString*) data {
    NSMutableString * datastr = nil;
    NSNumber * numerator = nil;
    NSNumber * denominator = nil;
    NSNumber * formatcode = [dataformat objectAtIndex:1];
    
    switch ([formatcode intValue]) {
        case EDT_UBYTE:
            break;
        case EDT_ASCII_STRING:
            datastr = [[NSMutableString alloc] init];
            for (int i = 0; i < [data length]; i++) {
                [datastr appendFormat:@"%02x",[data characterAtIndex:i]];
            }
            if ([datastr length] < 8) {
                NSString * format = [NSString stringWithFormat:@"%%0%dd", 8 - [datastr length]];
                [datastr appendFormat:format,0];
            }
            return datastr;
        case EDT_USHORT:
            return [[NSString alloc] initWithFormat : @"%@%@",
                    [self formattedHexStringFromDecimalNumber: [NSNumber numberWithInt: [data intValue]] withPlaces: @4],
                    @"00000000"];
        case EDT_ULONG:
            numerator = [NSNumber numberWithUnsignedLong:[data intValue]];
            return [NSString stringWithFormat : @"%@",
                    [self formattedHexStringFromDecimalNumber: numerator withPlaces: @8]];
        case EDT_URATIONAL:
            return [self decimalToUnsignedRational: [NSNumber numberWithDouble:[data doubleValue]]
                            outputNumerator: numerator
                          outputDenominator: denominator];
        case EDT_SBYTE:
            break;
        case EDT_UNDEFINED:
            break;     // 8 bits
        case EDT_SSHORT:
            break;
        case EDT_SLONG:
            break;          // 32bit signed integer (2's complement)
        case EDT_SRATIONAL:
            break;     // 2 SLONGS, first long is numerator, second is denominator
        case EDT_SINGLEFLOAT:
            break;
        case EDT_DOUBLEFLOAT:
            break;
    }
    return datastr;
}


//======================================================================================================================

//======================================================================================================================

/**
 * creates a formatted little endian hex string from a number and width specifier
 */
- (NSString*) formattedHexStringFromDecimalNumber: (NSNumber*) numb withPlaces: (NSNumber*) width {
    NSMutableString * str = [[NSMutableString alloc] initWithCapacity:[width intValue]];
    NSString * formatstr = [[NSString alloc] initWithFormat: @"%%%@%dx", @"0", [width intValue]];
    [str appendFormat:formatstr, [numb intValue]];
    return str;
}

- (NSString*) formatWithLeadingZeroes: (NSNumber *) places: (NSNumber *) numb {
    
    NSNumberFormatter * formatter = [[NSNumberFormatter alloc] init];
   // NSString * formatstr = [@"" stringByPaddingToLength:places withsString: @"0" ];
    NSString *formatstr = [@"" stringByPaddingToLength:[places unsignedIntegerValue] withString:@"0" startingAtIndex:0];
    [formatter setPositiveFormat:formatstr];
    
    return [formatter stringFromNumber:numb];
}

// approximate a decimal with a rational by method of continued fraction
- (void) decimalToRational: (NSNumber *) numb: (NSNumber *) numerator: (NSNumber*) denominator {
    numerator = [NSNumber numberWithLong: 1];
    denominator = [NSNumber numberWithLong: 1];
}

// approximate a decimal with an unsigned rational by method of continued fraction
- (NSString*) decimalToUnsignedRational: (NSNumber *) numb outputNumerator: (NSNumber *) num outputDenominator: (NSNumber*) deno {
    num = [NSNumber numberWithUnsignedLong: 1];
    deno = [NSNumber numberWithUnsignedLong: 1];

    //calculate initial values
    int term = [numb intValue];
    double error = [numb doubleValue] - term;

    NSMutableArray * fractionlist = [[NSMutableArray alloc] initWithCapacity:8];
    [self continuedFraction: [numb doubleValue] withFractionList:fractionlist];
    [self expandContinuedFraction: fractionlist];
    return [self formatFractionList: fractionlist];
}


- (void) continuedFraction: (double) val withFractionList:(NSMutableArray*) fractionlist {
    int whole;
    double remainder;
    // 1. split term
    [self splitDouble: val withIntComponent: &whole withFloatRemainder: &remainder];
    [fractionlist addObject: [NSNumber numberWithInt:whole]];
    
    // 2. calculate reciprocal of remainder
    if (!remainder) return; // early exit, exact fraction found, avoids recip/0
    double recip = 1 / remainder;

    // 3. exit condition
    if ([fractionlist count] > 8) {
        return;
    }
    
    // 4. recurse
    [self continuedFraction:recip withFractionList: fractionlist];
    
}


-(void) simplifyPartialQuotients: (NSArray*) arr {
    int denominator = [[arr lastObject] intValue];
    int numerator = 1;
    for (int i = [arr count]; i > 0; i--) {
       // [self op1: [arr objectAtIndex:i] withNumerator:]
    }
    
}

-(void) expandContinuedFraction: (NSArray*) fractionlist {
    int i = 0;
    int den = 0;
    int num = 0;

    //begin at the end of the list
    i = [fractionlist count] - 1;
    num = 1;
    den = [fractionlist objectAtIndex:i];
    
    while (i > 0) {
        int t = [fractionlist objectAtIndex: i-1];
        num = t * den + num;
        if (i==1) {
            break;
        } else {
            t = num;
            num = den;
            den = t;
        }
        i--;
    }
    
    NSLog(@"%d %d",den,num);
}

- (void) op1: (int) n withNumerator: (NSNumber*) num withDenominator: (NSNumber*) denom {
    num = [NSNumber numberWithInt:[denom intValue]*n+[num intValue]];
}


- (NSString*) formatFractionList: (NSArray *) fractionlist {
    NSMutableString * str = [[NSMutableString alloc] initWithCapacity:16];
    
    if ([fractionlist count] == 1){
        [str appendFormat: @"%08x00000001", [[fractionlist objectAtIndex:0] intValue]];
    }
    return str;
}

// split a floating point number into two integer values representing the left and right side of the decimal
- (void) splitDouble: (double) val withIntComponent: (int*) rightside withFloatRemainder: (double*) leftside {
    *rightside = val; // convert numb to int representation, which truncates the decimal portion
    *leftside = val - *rightside;
//    int digits = [[NSString stringWithFormat:@"%f", de] length] - 2;
//    *leftside =  de * pow(10,digits);;
}


//
- (NSString*) hexStringFromData : (NSData*) data {
    //overflow detection
    const unsigned char *dataBuffer = [data bytes];
    return [[NSString alloc] initWithFormat: @"%02x%02x",
                                        (unsigned char)dataBuffer[0],
                                        (unsigned char)dataBuffer[1]];
}

// convert a hex string to a number
- (NSNumber*) numericFromHexString : (NSString *) hexstring {
    NSScanner * scan = NULL;
    unsigned int numbuf= 0;
    
    scan = [NSScanner scannerWithString:hexstring];
    [scan scanHexInt:&numbuf];
    return [NSNumber numberWithInt:numbuf];
}

@end
