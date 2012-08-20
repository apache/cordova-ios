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


#import "CDVContacts.h"
#import <UIKit/UIKit.h>
#import "NSArray+Comparisons.h"
#import "NSDictionary+Extensions.h"
#import "CDVNotification.h"


@implementation CDVContactsPicker

@synthesize allowsEditing;
@synthesize callbackId;
@synthesize options;
@synthesize pickedContactDictionary;

@end
@implementation CDVNewContactsController

@synthesize callbackId;

@end

@implementation CDVContacts

dispatch_queue_t workQueue = nil;

// no longer used since code gets AddressBook for each operation. 
// If address book changes during save or remove operation, may get error but not much we can do about it
// If address book changes during UI creation, display or edit, we don't control any saves so no need for callback
/*void addressBookChanged(ABAddressBookRef addressBook, CFDictionaryRef info, void* context)
{
	// note that this function is only called when another AddressBook instance modifies 
	// the address book, not the current one. For example, through an OTA MobileMe sync
	Contacts* contacts = (Contacts*)context;
	[contacts addressBookDirty];
}*/
+(void) initialize {
    workQueue = dispatch_queue_create("contacts work queue", DISPATCH_QUEUE_SERIAL);
}
+(dispatch_queue_t) getWorkQueue {
    return workQueue;
}

-(CDVPlugin*) initWithWebView:(UIWebView*)theWebView
{
    self = (CDVContacts*)[super initWithWebView:(UIWebView*)theWebView];
    /*if (self) {
		addressBook = ABAddressBookCreate();
		ABAddressBookRegisterExternalChangeCallback(addressBook, addressBookChanged, self);
    }*/
	
	return self;
}


// overridden to clean up Contact statics
-(void)onAppTerminate
{
    //NSLog(@"Contacts::onAppTerminate");
}
-(void) dealloc
{
    dispatch_release(workQueue);
}

// iPhone only method to create a new contact through the GUI
- (void) newContact:(CDVInvokedUrlCommand*)command
{	
    NSString* callbackId = command.callbackId;

	CDVNewContactsController* npController = [[CDVNewContactsController alloc] init];
	
	ABAddressBookRef ab = ABAddressBookCreate();
	npController.addressBook = ab; // a CF retaining assign
    CFRelease(ab);
    
	npController.newPersonViewDelegate = self;
	npController.callbackId = callbackId;

	UINavigationController *navController = [[UINavigationController alloc] initWithRootViewController:npController];
    
    if ([self.viewController respondsToSelector:@selector(presentViewController:::)]) {
        [self.viewController presentViewController:navController animated:YES completion:nil];        
    } else {
        [self.viewController presentModalViewController:navController animated:YES ];
    }              
}

- (void) newPersonViewController:(ABNewPersonViewController*)newPersonViewController didCompleteWithNewPerson:(ABRecordRef)person
{

	ABRecordID recordId = kABRecordInvalidID;
	CDVNewContactsController* newCP = (CDVNewContactsController*) newPersonViewController;
	NSString* callbackId = newCP.callbackId;
	
	if (person != NULL) {
			//return the contact id
			recordId = ABRecordGetRecordID(person);
	}

    if ([newPersonViewController respondsToSelector:@selector(presentingViewController)]) { 
        [[newPersonViewController presentingViewController] dismissViewControllerAnimated:YES completion:nil];
    } else {
        [[newPersonViewController parentViewController] dismissModalViewControllerAnimated:YES];
    }        
    
	CDVPluginResult* result = [CDVPluginResult resultWithStatus: CDVCommandStatus_OK messageAsInt:  recordId];
	//jsString = [NSString stringWithFormat: @"%@(%d);", newCP.jsCallback, recordId];
	[self writeJavascript: [result toSuccessCallbackString:callbackId]];
	
}

- (void) displayContact:(CDVInvokedUrlCommand*)command
{
    NSString* callbackId = command.callbackId;
	ABRecordID recordID = [[command.arguments objectAtIndex:0] intValue];
    NSDictionary* options = [command.arguments objectAtIndex:1 withDefault:[NSNull null]];
	
	bool bEdit = [options isKindOfClass:[NSNull class]] ? false : [options existsValue:@"true" forKey:@"allowsEditing"];
	ABAddressBookRef addrBook = ABAddressBookCreate();	
	ABRecordRef rec = ABAddressBookGetPersonWithRecordID(addrBook, recordID);
	if (rec) {
		CDVDisplayContactViewController* personController = [[CDVDisplayContactViewController alloc] init];
		personController.displayedPerson = rec;
		personController.personViewDelegate = self;
		personController.allowsEditing = NO;
		
        // create this so DisplayContactViewController will have a "back" button.
        UIViewController* parentController = [[UIViewController alloc] init];
        UINavigationController *navController = [[UINavigationController alloc] initWithRootViewController:parentController];

        [navController pushViewController:personController animated:YES];

        if ([self.viewController respondsToSelector:@selector(presentViewController:::)]) {
            [self.viewController presentViewController:navController animated:YES completion:nil];        
        } else {
            [self.viewController presentModalViewController:navController animated:YES ];
        }              

		if (bEdit) {
            // create the editing controller and push it onto the stack
            ABPersonViewController* editPersonController = [[ABPersonViewController alloc] init];
            editPersonController.displayedPerson = rec;
            editPersonController.personViewDelegate = self;
            editPersonController.allowsEditing = YES; 
            [navController pushViewController:editPersonController animated:YES];
        }
	} 
	else 
	{
		// no record, return error
		CDVPluginResult* result = [CDVPluginResult resultWithStatus: CDVCommandStatus_OK messageAsInt:  UNKNOWN_ERROR];
		[self writeJavascript:[result toErrorCallbackString:callbackId]];
		
	}
	CFRelease(addrBook);
}
								   
- (BOOL) personViewController:(ABPersonViewController *)personViewController shouldPerformDefaultActionForPerson:(ABRecordRef)person 
					 property:(ABPropertyID)property identifier:(ABMultiValueIdentifier)identifierForValue
{
	return YES;
}
	
- (void) chooseContact:(CDVInvokedUrlCommand*)command
{
    NSString* callbackId = command.callbackId;
    NSDictionary* options = [command.arguments objectAtIndex:0 withDefault:[NSNull null]];
	
	CDVContactsPicker* pickerController = [[CDVContactsPicker alloc] init];
	pickerController.peoplePickerDelegate = self;
	pickerController.callbackId = callbackId;
	pickerController.options = options;
	pickerController.pickedContactDictionary = [NSDictionary dictionaryWithObjectsAndKeys:[NSNumber numberWithInt:kABRecordInvalidID], kW3ContactId, nil];
	pickerController.allowsEditing = (BOOL)[options existsValue:@"true" forKey:@"allowsEditing"];
	
    if ([self.viewController respondsToSelector:@selector(presentViewController:::)]) {
        [self.viewController presentViewController:pickerController animated:YES completion:nil];        
    } else {
        [self.viewController presentModalViewController:pickerController animated:YES ];
    }              
}

- (BOOL) peoplePickerNavigationController:(ABPeoplePickerNavigationController*)peoplePicker 
	     shouldContinueAfterSelectingPerson:(ABRecordRef)person
{
	
	CDVContactsPicker* picker = (CDVContactsPicker*)peoplePicker;
    NSNumber* pickedId =  [NSNumber numberWithInt: ABRecordGetRecordID(person)];

	if (picker.allowsEditing) {
		
		ABPersonViewController* personController = [[ABPersonViewController alloc] init];
		personController.displayedPerson = person;
		personController.personViewDelegate = self;
		personController.allowsEditing = picker.allowsEditing;
        // store id so can get info in peoplePickerNavigationControllerDidCancel
        picker.pickedContactDictionary = [NSDictionary dictionaryWithObjectsAndKeys:pickedId, kW3ContactId, nil];
		
		[peoplePicker pushViewController:personController animated:YES];
	} else {
        // Retreive and return pickedContact information
        CDVContact* pickedContact = [[CDVContact alloc] initFromABRecord:(ABRecordRef)person];
        NSArray *fields = [picker.options objectForKey:@"fields"];
        NSDictionary *returnFields = [[CDVContact class] calcReturnFields: fields];
        picker.pickedContactDictionary = [pickedContact toDictionary:returnFields];

		CDVPluginResult *result = [CDVPluginResult resultWithStatus: CDVCommandStatus_OK messageAsDictionary: picker.pickedContactDictionary];
		[self writeJavascript:[result toSuccessCallbackString: picker.callbackId]];
		
        if ([picker respondsToSelector:@selector(presentingViewController)]) { 
            [[picker presentingViewController] dismissViewControllerAnimated:YES completion:nil];
        } else {
            [[picker parentViewController] dismissModalViewControllerAnimated:YES];
        }        
	}
	return NO;
}

- (BOOL) peoplePickerNavigationController:(ABPeoplePickerNavigationController*)peoplePicker 
	     shouldContinueAfterSelectingPerson:(ABRecordRef)person property:(ABPropertyID)property identifier:(ABMultiValueIdentifier)identifier
{
	return YES;
}

- (void) peoplePickerNavigationControllerDidCancel:(ABPeoplePickerNavigationController *)peoplePicker
{
	// return contactId or invalid if none picked
	CDVContactsPicker* picker = (CDVContactsPicker*)peoplePicker;
    if (picker.allowsEditing) {
        // get the info after possible edit
        ABAddressBookRef addrBook = ABAddressBookCreate();
        ABRecordRef person = ABAddressBookGetPersonWithRecordID(addrBook, [[picker.pickedContactDictionary objectForKey:kW3ContactId] integerValue]);
        CDVContact* pickedContact = [[CDVContact alloc] initFromABRecord:(ABRecordRef)person];
        NSArray *fields = [picker.options objectForKey:@"fields"];
        NSDictionary *returnFields = [[CDVContact class] calcReturnFields: fields];
        picker.pickedContactDictionary = [pickedContact toDictionary:returnFields];
        CFRelease(addrBook);

    }
	CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:picker.pickedContactDictionary];
	[self writeJavascript:[result toSuccessCallbackString:picker.callbackId]];
	
    if ([peoplePicker respondsToSelector:@selector(presentingViewController)]) { 
        [[peoplePicker presentingViewController] dismissViewControllerAnimated:YES completion:nil];
    } else {
        [[peoplePicker parentViewController] dismissModalViewControllerAnimated:YES];
    }        
}

- (void) search:(CDVInvokedUrlCommand*)command
{

    NSString* callbackId = command.callbackId;
    NSArray* fields = [command.arguments objectAtIndex:0];
    NSDictionary* findOptions = [command.arguments objectAtIndex:1 withDefault:[NSNull null]];
	
    dispatch_async([CDVContacts getWorkQueue],^{
        
        // from Apple:  Important You must ensure that an instance of ABAddressBookRef is used by only one thread.
        // which is why ABAddressBookCreate() is done within the dispatch queue.
        // more details here: http: //blog.byadrian.net/2012/05/05/ios-addressbook-framework-and-gcd/
        ABAddressBookRef  addrBook = ABAddressBookCreate();
        
        NSString* jsString = nil;
        NSArray*  foundRecords = nil;
        // get the findOptions values
        BOOL multiple = NO; // default is false
        NSString* filter = nil;
        if (![findOptions isKindOfClass:[NSNull class]]){
            id value = nil;
            filter = (NSString*)[findOptions objectForKey:@"filter"];
            value = [findOptions objectForKey:@"multiple"];
            if ([value isKindOfClass:[NSNumber class]]){
                // multiple is a boolean that will come through as an NSNumber
                multiple = [(NSNumber*)value boolValue];
                //NSLog(@"multiple is: %d", multiple);
            }
        }
        
        NSDictionary* returnFields = [[CDVContact class] calcReturnFields: fields];
        
        
        NSMutableArray* matches = nil;
        if (!filter || [filter isEqualToString:@""]){
            // get all records
            foundRecords = (__bridge_transfer NSArray*)ABAddressBookCopyArrayOfAllPeople(addrBook);
            if (foundRecords && [foundRecords count] > 0){
                // create Contacts and put into matches array
                // doesn't make sense to ask for all records when multiple == NO but better check
                int xferCount = multiple == YES ? [foundRecords count] : 1;
                matches = [NSMutableArray arrayWithCapacity:xferCount];
                for(int k = 0; k<xferCount; k++){
                    CDVContact* xferContact = [[CDVContact alloc] initFromABRecord:(ABRecordRef)[foundRecords objectAtIndex:k]];
                    [matches addObject:xferContact];
                    xferContact = nil;

                }
            }
        } else {
            foundRecords = (__bridge_transfer NSArray*)ABAddressBookCopyArrayOfAllPeople(addrBook);
            matches = [NSMutableArray arrayWithCapacity:1];
            BOOL bFound = NO;
            int testCount = [foundRecords count];
            for(int j=0; j<testCount; j++){
                CDVContact* testContact = [[CDVContact alloc] initFromABRecord: (ABRecordRef)[foundRecords objectAtIndex:j]];
                if (testContact){
                    bFound = [testContact foundValue:filter inFields:returnFields];
                    if(bFound){
                        [matches addObject:testContact];
                    }
                    testContact = nil;
                }
            }
        }
        NSMutableArray* returnContacts = [NSMutableArray arrayWithCapacity:1];
    
        if (matches != nil && [matches count] > 0){
            // convert to JS Contacts format and return in callback
            // - returnFields  determines what properties to return
            @autoreleasepool {
                int count = multiple == YES ? [matches count] : 1;
                for(int i = 0; i<count; i++){
                    CDVContact* newContact = [matches objectAtIndex:i];
                    NSDictionary* aContact = [newContact toDictionary: returnFields];
                    [returnContacts addObject:aContact];
                }
            }
        }
        CDVPluginResult* result = nil;
        // return found contacts (array is empty if no contacts found)
        result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsArray: returnContacts];
        jsString = [result toSuccessCallbackString:callbackId];
        //NSLog(@"findCallback string: %@", jsString);

        if(jsString){
            dispatch_async(dispatch_get_main_queue(),^{
                [self writeJavascript:jsString];
            });
        }
        if(addrBook){
            CFRelease(addrBook);
        }
    }); // end of workQueue block
    
	return;
	
	
}
- (void) save:(CDVInvokedUrlCommand*)command
{
    NSString* callbackId = command.callbackId;
    NSDictionary* contactDict = [command.arguments objectAtIndex:0];

    dispatch_async([CDVContacts getWorkQueue],^{
        NSString* jsString = nil;
        bool bIsError = FALSE, bSuccess = FALSE;
        BOOL bUpdate = NO;
        CDVContactError errCode = UNKNOWN_ERROR;
        CFErrorRef error;
        CDVPluginResult* result = nil;

        ABAddressBookRef addrBook = ABAddressBookCreate();
        NSNumber* cId = [contactDict valueForKey:kW3ContactId];
        CDVContact* aContact = nil;
        ABRecordRef rec = nil;
        if (cId && ![cId isKindOfClass:[NSNull class]]){
            rec = ABAddressBookGetPersonWithRecordID(addrBook, [cId intValue]);
            if (rec){
                aContact = [[CDVContact alloc] initFromABRecord: rec ];
                bUpdate = YES;
            }
        }
        if (!aContact){
            aContact = [[CDVContact alloc] init];
        }

        bSuccess = [aContact setFromContactDict: contactDict asUpdate: bUpdate];
        if (bSuccess){
            if (!bUpdate){
                bSuccess = ABAddressBookAddRecord(addrBook, [aContact record], &error);
            }
            if (bSuccess) {
                bSuccess = ABAddressBookSave(addrBook, &error);
            }
            if (!bSuccess){  // need to provide error codes
                bIsError = TRUE;
                errCode = IO_ERROR;
            } else {

                // give original dictionary back?  If generate dictionary from saved contact, have no returnFields specified
                // so would give back all fields (which W3C spec. indicates is not desired)
                // for now (while testing) give back saved, full contact
                NSDictionary* newContact = [aContact toDictionary: [CDVContact defaultFields]];
                //NSString* contactStr = [newContact JSONRepresentation];
                result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary: newContact];
                jsString = [result toSuccessCallbackString:callbackId];
            }
        } else {
            bIsError = TRUE;
            errCode = IO_ERROR;
        }
        CFRelease(addrBook);
		
        if (bIsError){
            result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsInt: errCode];
            jsString = [result toErrorCallbackString:callbackId];
        }

        if(jsString){
            dispatch_async(dispatch_get_main_queue(),^{
                [self writeJavascript:jsString];
            });

        }
	});// end of  queue

	
}	
- (void) remove:(CDVInvokedUrlCommand*)command
{
    NSString* callbackId = command.callbackId;
    NSNumber* cId = [command.arguments objectAtIndex:0];
	NSString* jsString = nil;
	bool bIsError = FALSE, bSuccess = FALSE;
	CDVContactError errCode = UNKNOWN_ERROR;
	CFErrorRef error;
	ABAddressBookRef addrBook = nil;
	ABRecordRef rec = nil;
	CDVPluginResult* result = nil;
	
	//NSMutableDictionary* contactDict = options;
	addrBook = ABAddressBookCreate();	
	//NSNumber* cId = [contactDict valueForKey:kW3ContactId];
	if (cId && ![cId isKindOfClass:[NSNull class]] && [cId intValue] != kABRecordInvalidID){
		rec = ABAddressBookGetPersonWithRecordID(addrBook, [cId intValue]);
		if (rec){
			bSuccess = ABAddressBookRemoveRecord(addrBook, rec, &error);
			if (!bSuccess){
				bIsError = TRUE;
				errCode = IO_ERROR; 
			} else {
				bSuccess = ABAddressBookSave(addrBook, &error);
				if(!bSuccess){
					bIsError = TRUE;
					errCode = IO_ERROR;
				}else {
					// set id to null
					//[contactDict setObject:[NSNull null] forKey:kW3ContactId];
                    //result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary: contactDict];
                    result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
					jsString = [result toSuccessCallbackString:callbackId];
					//NSString* contactStr = [contactDict JSONRepresentation];
				}
			}						
		} else {
			// no record found return error
			bIsError = TRUE;
			errCode = UNKNOWN_ERROR;
		}
		
	} else {
		// invalid contact id provided
		bIsError = TRUE;
		errCode = INVALID_ARGUMENT_ERROR;
	}
	

	if (addrBook){
		CFRelease(addrBook);
	}
	if (bIsError){
		result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsInt: errCode];
		 jsString = [result toErrorCallbackString:callbackId];
	}
	if (jsString){
		[self writeJavascript:jsString];
	}	
		
	return;
		
}


@end

/* ABPersonViewController does not have any UI to dismiss.  Adding navigationItems to it does not work properly
 * The navigationItems are lost when the app goes into the background.  The solution was to create an empty
 * NavController in front of the ABPersonViewController. This will cause the ABPersonViewController to have a back button. By subclassing the ABPersonViewController, we can override viewDidDisappear and take down the entire NavigationController.
 */ 
@implementation CDVDisplayContactViewController
@synthesize contactsPlugin;


- (void)viewWillDisappear: (BOOL)animated
{
    [super viewWillDisappear: animated];
    
    if ([self respondsToSelector:@selector(presentingViewController)]) { 
        [[self presentingViewController] dismissViewControllerAnimated:YES completion:nil];
    } else {
        [[self parentViewController] dismissModalViewControllerAnimated:YES];
    }        
    
}

@end

