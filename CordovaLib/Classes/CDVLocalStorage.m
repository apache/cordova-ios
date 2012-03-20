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

#import "CDVLocalStorage.h"
#import "CDV.h"

@interface CDVLocalStorage ()

@property (nonatomic, readwrite, retain) NSMutableArray* backupInfo;  // array of CDVBackupInfo objects
@property (nonatomic, readwrite, assign) id<UIWebViewDelegate> webviewDelegate;

@end


@implementation CDVLocalStorage

@synthesize backupInfo, webviewDelegate;


- (CDVPlugin*) initWithWebView:(UIWebView*)theWebView
{
    self = (CDVLocalStorage*)[super initWithWebView:theWebView];
    if (self) 
    {
        [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(onResignActive) 
                                                     name:UIApplicationWillResignActiveNotification object:nil];
        
        NSString *original, *backup;
        self.backupInfo = [NSMutableArray arrayWithCapacity:3];
        
        // set up common folders
        NSString* appLibraryFolder = [NSSearchPathForDirectoriesInDomains(NSLibraryDirectory, NSUserDomainMask, YES)objectAtIndex:0];
        NSString* appDocumentsFolder = [NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES) objectAtIndex:0];
        NSString* backupsFolder = [appDocumentsFolder stringByAppendingPathComponent:@"Backups"];
        
        // create the backups folder
        [[NSFileManager defaultManager] createDirectoryAtPath:backupsFolder withIntermediateDirectories:YES attributes:nil error:nil];

        //////////// LOCALSTORAGE
        
        original = [[appLibraryFolder stringByAppendingPathComponent:
                                 (IsiOSVersion(@"5.1")) ? @"Caches" : @"WebKit/LocalStorage"]
                                 stringByAppendingPathComponent:@"file__0.localstorage"]; 
                                   
        backup = [backupsFolder stringByAppendingPathComponent:@"localstorage.appdata.db"];
        
        CDVBackupInfo* backupItem = [[[CDVBackupInfo alloc] init] autorelease];
        backupItem.backup = backup;
        backupItem.original = original;
        backupItem.label = @"localStorage database";
        
        [self.backupInfo addObject:backupItem];
        
        //////////// WEBSQL MAIN DB

        original = [[appLibraryFolder stringByAppendingPathComponent:
                     (IsiOSVersion(@"5.1")) ? @"Caches" : @"WebKit/Databases"]
                    stringByAppendingPathComponent:@"Databases.db"]; 
        
        backup = [backupsFolder stringByAppendingPathComponent:@"websqlmain.appdata.db"];
        
        backupItem = [[[CDVBackupInfo alloc] init] autorelease];
        backupItem.backup = backup;
        backupItem.original = original;
        backupItem.label = @"websql main database";
        
        [self.backupInfo addObject:backupItem];
        
        //////////// WEBSQL DATABASES
        
        original = [[appLibraryFolder stringByAppendingPathComponent:
                     (IsiOSVersion(@"5.1")) ? @"Caches" : @"WebKit/Databases"]
                    stringByAppendingPathComponent:@"file__0"]; 
        
        backup = [backupsFolder stringByAppendingPathComponent:@"websqldbs.appdata.db"];
        
        backupItem = [[[CDVBackupInfo alloc] init] autorelease];
        backupItem.backup = backup;
        backupItem.original = original;
        backupItem.label = @"websql databases";
        
        [self.backupInfo addObject:backupItem];

        ////////////
        
        // over-ride current webview delegate (for restore reasons)
        self.webviewDelegate = theWebView.delegate;
        theWebView.delegate = self;
        
        // verify the and fix the iOS 5.1 database locations once
        [self verifyAndFixDatabaseLocations:nil withDict:nil];
    }
    
    return self;
}

#pragma mark -
#pragma mark Plugin interface methods

- (BOOL) copyFrom:(NSString*)src to:(NSString*)dest error:(NSError**)error
{
    NSFileManager* fileManager = [NSFileManager defaultManager];
    
    if (![fileManager fileExistsAtPath:src]) {

        NSString* errorString = [NSString stringWithFormat:@"%@ file does not exist.", src];
        if (error != NULL) {
            (*error) = [NSError errorWithDomain:kCDVLocalStorageErrorDomain 
                                           code:kCDVLocalStorageFileOperationError 
                                       userInfo:[NSDictionary dictionaryWithObject:errorString 
                                                 forKey:NSLocalizedDescriptionKey]];
        }
        return NO;
    }
    
    // generate unique filepath in temp directory
    CFUUIDRef uuidRef = CFUUIDCreate(kCFAllocatorDefault);
    CFStringRef uuidString = CFUUIDCreateString(kCFAllocatorDefault, uuidRef);
    NSString* tempBackup = [[NSTemporaryDirectory() stringByAppendingPathComponent:(NSString*)uuidString] stringByAppendingPathExtension:@"bak"];
    CFRelease(uuidString);
    CFRelease(uuidRef);
    
    BOOL destExists = [fileManager fileExistsAtPath:dest];
    
    // backup the dest
    if (destExists && ![fileManager copyItemAtPath:dest toPath:tempBackup error:error]) {
        return NO;
    } 
    
    // remove the dest
    if (destExists && ![fileManager removeItemAtPath:dest error:error]) { 
        return NO;
    } 
    
    // copy src to dest
    if ([fileManager copyItemAtPath:src toPath:dest error:error]) {
        // success - cleanup - delete the backup to the dest
        if ([fileManager fileExistsAtPath:tempBackup]) {
            [fileManager removeItemAtPath:tempBackup error:error]; 
        }
        return YES;

    } else {
        // failure - we restore the temp backup file to dest
        [fileManager copyItemAtPath:tempBackup toPath:dest error:error];
        // cleanup - delete the backup to the dest
        if ([fileManager fileExistsAtPath:tempBackup]) {
            [fileManager removeItemAtPath:tempBackup error:error]; 
        }
        return NO;
    }
}

/* copy from webkitDbLocation to persistentDbLocation */
- (void) backup:(NSArray*)arguments withDict:(NSMutableDictionary*)options;
{
    NSError* error = nil;
    
    for (CDVBackupInfo* info in self.backupInfo)
    {
        [self copyFrom:info.original to:info.backup error:&error];
        
        if (error == nil) {
            NSLog(@"Backed up: %@", info.label);
        } else {
            NSLog(@"Error in CDVLocalStorage (%@) backup: %@", info.label, [error localizedDescription]);
        }
    }
}

/* copy from persistentDbLocation to webkitDbLocation */
- (void) restore:(NSArray*)arguments withDict:(NSMutableDictionary*)options;
{
    NSError* error = nil;
    
    for (CDVBackupInfo* info in self.backupInfo)
    {
        [self copyFrom:info.backup to:info.original error:&error];
        
        if (error == nil) {
            NSLog(@"CDVLocalStorage restored: %@", info.label);
        } else {
            NSLog(@"Error in CDVLocalStorage (%@) restore: %@", info.label, [error localizedDescription]);
        }
    }
}

- (void) verifyAndFixDatabaseLocations:(NSArray*)arguments withDict:(NSMutableDictionary*)options
{
    NSUserDefaults* appPreferences = [NSUserDefaults standardUserDefaults];
    NSBundle* mainBundle = [NSBundle mainBundle];

    NSString* bundlePath = [[mainBundle bundlePath] stringByDeletingLastPathComponent];
    NSString* bundleIdentifier = [[mainBundle infoDictionary] objectForKey:@"CFBundleIdentifier"];

    NSString* appPlistPath = [[bundlePath stringByAppendingPathComponent:@"Library/Preferences"] stringByAppendingPathComponent:[NSString stringWithFormat:@"%@.plist", bundleIdentifier]];
    NSMutableDictionary* appPlistDict = [NSMutableDictionary dictionaryWithContentsOfFile:appPlistPath];
    
    NSArray* keysToCheck = [NSArray arrayWithObjects:
                            @"WebKitLocalStorageDatabasePathPreferenceKey", @"WebDatabaseDirectory", nil];
    
    
    BOOL dirty = NO;
    NSString* pathSuffix =  (IsiOSVersion(@"5.1")) ? @"Library/Caches" : @"Library/WebKit";

    for (NSString* key in keysToCheck) 
    {
        NSString* value = [appPlistDict objectForKey:key];
        // verify path is in app bundle, if not - fix
        if (![value hasPrefix:bundlePath]) {
            [appPlistDict setValue:[bundlePath stringByAppendingPathComponent:pathSuffix] forKey:key];
            dirty = YES;
        }
    }
    
    if (dirty) 
    {
        BOOL ok = [appPlistDict writeToFile:appPlistPath atomically:YES];
        NSLog(@"Fix applied for database locations?: %@", ok? @"YES":@"NO");
    
        [appPreferences synchronize];
    }
}

#pragma mark -
#pragma mark Notification handlers

- (void) onResignActive
{
    [self backup:nil withDict:nil];    
}

- (void) onAppTerminate
{
    [self backup:nil withDict:nil];    
}

#pragma mark -
#pragma mark UIWebviewDelegate implementation and forwarding

- (void) webViewDidStartLoad:(UIWebView*)theWebView
{
    [self restore:nil withDict:nil];
    
    return [self.webviewDelegate webViewDidStartLoad:theWebView];
}

- (void) webViewDidFinishLoad:(UIWebView*)theWebView 
{
    return [self.webviewDelegate webViewDidFinishLoad:theWebView];
}

- (void) webView:(UIWebView*)theWebView didFailLoadWithError:(NSError*)error 
{
    return [self.webviewDelegate webView:theWebView didFailLoadWithError:error];
}

- (BOOL) webView:(UIWebView*)theWebView shouldStartLoadWithRequest:(NSURLRequest*)request navigationType:(UIWebViewNavigationType)navigationType
{
    return [self.webviewDelegate webView:theWebView shouldStartLoadWithRequest:request navigationType:navigationType];
}

#pragma mark -
#pragma mark Over-rides

- (void) dealloc
{
    self.backupInfo = nil;
    
    [super dealloc];
}

@end


#pragma mark -
#pragma mark CDVBackupInfo implementation

@implementation CDVBackupInfo

@synthesize original, backup, label;

@end