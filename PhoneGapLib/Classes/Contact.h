/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 * 
 * Copyright (c) 2005-2010, Nitobi Software Inc.
 * Copyright (c) 2010, IBM Corporation
 */

#import <Foundation/Foundation.h>
#import <AddressBook/ABAddressBook.h>
#import <AddressBookUI/AddressBookUI.h>



enum ContactError {
	UNKNOWN_ERROR = 0,
	INVALID_ARGUMENT_ERROR = 1,
	NOT_FOUND_ERROR = 2,
	TIMEOUT_ERROR = 3,
	PENDING_OPERATION_ERROR = 4,
	IO_ERROR = 5,
	NOT_SUPPORTED_ERROR = 6,
	PERMISSION_DENIED_ERROR = 20
};
typedef NSUInteger ContactError;

@interface Contact : NSObject {
	
	ABRecordRef record;			// the ABRecord associated with this contact
	NSNumber* contactId;		//unique identifier
	NSDictionary* returnFields;	// dictionary of fields to return when performing search
} 


@property (nonatomic, assign) ABRecordRef record;
@property (nonatomic, retain) NSNumber* contactId;
@property (nonatomic, retain) NSDictionary* returnFields;

//+(id) contact;	
//+(id) newFromABRecord:(ABRecordRef)aRecord;
//+(id) newFromABRecordId:(ABRecordID)aRecordId;
+(NSDictionary*) defaultABtoW3C;
+(NSDictionary*) defaultW3CtoAB;
+(NSSet*) defaultW3CtoNull;
+(NSDictionary*) defaultObjectAndProperties;
+(void) releaseDefaults;


+(NSMutableDictionary*) calcReturnFields: (NSArray*)fields;

-(id)initFromABRecord: (ABRecordRef) aRecord;
-(bool) setFromContactDict:(NSMutableDictionary*) aContact asUpdate: (BOOL)bUpdate;


//+(NSString*)convertABKeyToLabel:(CFStringRef)ABKey;
+(BOOL) needsConversion: (NSString*)W3Label;
+(CFStringRef) convertContactTypeToPropertyLabel:(NSString*)label;
+(NSString*) convertPropertyLabelToContactType: (NSString*)label;
-(bool) setValue: (id)aValue forProperty: (ABPropertyID) aProperty inRecord: (ABRecordRef) aRecord asUpdate: (BOOL)bUpdate;

-(NSMutableDictionary*) toDictionary: (NSDictionary*) withFields;
-(NSNumber*)getDateAsNumber: (ABPropertyID) datePropId;	
-(NSObject*) extractName;
-(NSObject*) extractMultiValue: (NSString*)propertyId;
-(NSObject*) extractAddresses;
-(NSObject*) extractIms;
-(NSObject*) extractOrganizations;
-(NSObject*) extractPhotos;

-(NSMutableDictionary*) translateW3Dict: (NSDictionary*) dict forProperty: (ABPropertyID) prop;	
-(bool) setMultiValueStrings: (NSArray*)fieldArray forProperty: (ABPropertyID) prop inRecord: (ABRecordRef)person asUpdate: (BOOL)bUpdate;
-(bool) setMultiValueDictionary: (NSArray*)array forProperty: (ABPropertyID) prop inRecord: (ABRecordRef)person asUpdate: (BOOL)bUpdate;
- (void) dealloc;	


@end

// generic ContactField types
#define kW3ContactFieldType @"type"
#define kW3ContactFieldValue @"value"
#define kW3ContactFieldPrimary @"primary"
// Various labels for ContactField types
#define kW3ContactWorkLabel @"work"
#define kW3ContactHomeLabel @"home"
#define kW3ContactOtherLabel @"other"
#define kW3ContactPhoneFaxLabel @"fax"
#define kW3ContactPhoneMobileLabel @"mobile"
#define kW3ContactPhonePagerLabel @"pager"
#define kW3ContactImAIMLabel @"aim"
#define kW3ContactImICQLabel @"icq"
#define kW3ContactImMSNLabel @"msn"
#define kW3ContactImYahooLabel @"yahoo"
#define kW3ContactFieldId @"id"
// special translation for IM field value and type
#define kW3ContactImType @"type"
#define kW3ContactImValue @"value"

// Contact object
#define kW3ContactId @"id"
#define kW3ContactName @"name"
#define kW3ContactFormattedName @"formatted"
#define kW3ContactGivenName @"givenName"
#define kW3ContactFamilyName @"familyName"
#define kW3ContactMiddleName @"middleName"
#define kW3ContactHonorificPrefix @"honorificPrefix"
#define kW3ContactHonorificSuffix @"honorificSuffix"
#define kW3ContactDisplayName @"displayName"
#define kW3ContactNickname @"nickname"
#define kW3ContactPhoneNumbers @"phoneNumbers"
#define kW3ContactAddresses @"addresses"
#define kW3ContactAddressFormatted @"formatted"
#define kW3ContactStreetAddress @"streetAddress"
#define kW3ContactLocality @"locality"
#define kW3ContactRegion @"region"
#define kW3ContactPostalCode @"postalCode"
#define kW3ContactCountry @"country"
#define kW3ContactEmails @"emails"
#define kW3ContactIms @"ims"
#define kW3ContactOrganizations @"organizations"
#define kW3ContactOrganizationName @"name"
#define kW3ContactTitle @"title"
#define kW3ContactDepartment @"department"
#define kW3ContactStartDate @"startDate"
#define kW3ContactEndDate @"endDate"
#define kW3ContactLocation @"location"
#define KW3ContactDescription @"description"
#define kW3ContactPublished @"published"
#define kW3ContactUpdated @"updated"
#define kW3ContactBirthday @"birthday"
#define kW3ContactAnniversary @"anniversary"
#define kW3ContactNote @"note"
#define kW3ContactPreferredUsername @"preferredUsername"
#define kW3ContactGender @"gender"
#define kW3ContactPhotos @"photos"
#define kW3ContactTags @"tags"
#define kW3ContactRelationships @"relationships"
#define kW3ContactUrls @"urls"
#define kW3ContactAccounts @"accounts"
#define kW3ContactUtcOffset @"utcOffset"
#define kW3ContactConnected @"connected"

