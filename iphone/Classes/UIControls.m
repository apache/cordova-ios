//
//  UIControls.m
//  PhoneGap
//
//  Created by Michael Nachbaur on 13/04/09.
//  Copyright 2009 Decaf Ninja Software. All rights reserved.
//

#import "UIControls.h"

@implementation UIControls
#ifndef __IPHONE_3_0
@synthesize webView;
#endif

-(PhoneGapCommand*) initWithWebView:(UIWebView*)theWebView
{
    self = (UIControls*)[super initWithWebView:theWebView];
    if (self) {
        tabBarItems = [[NSMutableDictionary alloc] initWithCapacity:5];
    }
    return self;
}

/**
 * Create a native tab bar at either the top or the bottom of the display.
 * @brief creates a tab bar
 * @param arguments unused
 * @param options unused
 */
- (void)createTabBar:(NSArray*)arguments withDict:(NSDictionary*)options
{
    tabBar = [UITabBar new];
    [tabBar sizeToFit];
    tabBar.delegate = self;
    tabBar.multipleTouchEnabled   = NO;
    tabBar.autoresizesSubviews    = YES;
    tabBar.hidden                 = YES;
    tabBar.userInteractionEnabled = YES;

	[self.webView.superview addSubview:tabBar];    
}

/**
 * Show the tab bar after its been created.
 * @brief show the tab bar
 * @param arguments unused
 * @param options used to indicate options for where and how the tab bar should be placed
 * - \c height integer indicating the height of the tab bar (default: \c 49)
 * - \c position specifies whether the tab bar will be placed at the \c top or \c bottom of the screen (default: \c bottom)
 */
- (void)showTabBar:(NSArray*)arguments withDict:(NSDictionary*)options
{
    if (!tabBar)
        [self createTabBar:nil withDict:nil];

    CGFloat height = 49.0f;
    BOOL atBottom = YES;
    
    NSDictionary* tabSettings = [settings objectForKey:@"TabBarSettings"];
    if (tabSettings) {
        height   = [[tabSettings objectForKey:@"height"] floatValue];
        atBottom = [[tabSettings objectForKey:@"position"] isEqualToString:@"bottom"];
    }
    tabBar.hidden = NO;

     CGRect webViewBounds = webView.bounds;
     CGRect tabBarBounds;
     if (atBottom) {
         tabBarBounds = CGRectMake(
             webViewBounds.origin.x,
             webViewBounds.origin.y + webViewBounds.size.height - height,
             webViewBounds.size.width,
             height
         );
         webViewBounds = CGRectMake(
            webViewBounds.origin.x,
            webViewBounds.origin.y,
            webViewBounds.size.width,
            webViewBounds.size.height - height
         );
     } else {
         tabBarBounds = CGRectMake(
             webViewBounds.origin.x,
             webViewBounds.origin.y,
             webViewBounds.size.width,
             height
         );
         webViewBounds = CGRectMake(
            webViewBounds.origin.x,
            webViewBounds.origin.y + height,
            webViewBounds.size.width,
            webViewBounds.size.height - height
         );
     }
     
    [tabBar setFrame:tabBarBounds];
    [webView setFrame:webViewBounds];
}

/**
 * Hide the tab bar
 * @brief hide the tab bar
 * @param arguments unused
 * @param options unused
 */
- (void)hideTabBar:(NSArray*)arguments withDict:(NSDictionary*)options
{
    if (!tabBar)
        [self createTabBar:nil withDict:nil];
    tabBar.hidden = YES;
}

/**
 * Create a new tab bar item for use on a previously created tab bar.  Use ::showTabBarItems to show the new item on the tab bar.
 *
 * If the supplied image name is one of the labels listed below, then this method will construct a tab button
 * using the standard system buttons.  Note that if you use one of the system images, that the \c title you supply will be ignored.
 * - <b>Tab Buttons</b>
 *   - tabButton:More
 *   - tabButton:Favorites
 *   - tabButton:Featured
 *   - tabButton:TopRated
 *   - tabButton:Recents
 *   - tabButton:Contacts
 *   - tabButton:History
 *   - tabButton:Bookmarks
 *   - tabButton:Search
 *   - tabButton:Downloads
 *   - tabButton:MostRecent
 *   - tabButton:MostViewed
 * @brief create a tab bar item
 * @param arguments Parameters used to create the tab bar
 *  -# \c name internal name to refer to this tab by
 *  -# \c title title text to show on the tab, or null if no text should be shown
 *  -# \c image image filename or internal identifier to show, or null if now image should be shown
 *  -# \c tag unique number to be used as an internal reference to this button
 * @param options Options for customizing the individual tab item
 *  - \c badge value to display in the optional circular badge on the item; if nil or unspecified, the badge will be hidden
 */
- (void)createTabBarItem:(NSArray*)arguments withDict:(NSDictionary*)options
{
    if (!tabBar)
        [self createTabBar:nil withDict:nil];

    NSString  *name      = [arguments objectAtIndex:0];
    NSString  *title     = [arguments objectAtIndex:1];
    NSString  *imageName = [arguments objectAtIndex:2];
    int tag              = [[arguments objectAtIndex:3] intValue];

    UITabBarItem *item = nil;    
    if ([imageName length] > 0) {
        UIBarButtonSystemItem systemItem = -1;
        if ([imageName isEqualToString:@"tabButton:More"])       systemItem = UITabBarSystemItemMore;
        if ([imageName isEqualToString:@"tabButton:Favorites"])  systemItem = UITabBarSystemItemFavorites;
        if ([imageName isEqualToString:@"tabButton:Featured"])   systemItem = UITabBarSystemItemFeatured;
        if ([imageName isEqualToString:@"tabButton:TopRated"])   systemItem = UITabBarSystemItemTopRated;
        if ([imageName isEqualToString:@"tabButton:Recents"])    systemItem = UITabBarSystemItemRecents;
        if ([imageName isEqualToString:@"tabButton:Contacts"])   systemItem = UITabBarSystemItemContacts;
        if ([imageName isEqualToString:@"tabButton:History"])    systemItem = UITabBarSystemItemHistory;
        if ([imageName isEqualToString:@"tabButton:Bookmarks"])  systemItem = UITabBarSystemItemBookmarks;
        if ([imageName isEqualToString:@"tabButton:Search"])     systemItem = UITabBarSystemItemSearch;
        if ([imageName isEqualToString:@"tabButton:Downloads"])  systemItem = UITabBarSystemItemDownloads;
        if ([imageName isEqualToString:@"tabButton:MostRecent"]) systemItem = UITabBarSystemItemMostRecent;
        if ([imageName isEqualToString:@"tabButton:MostViewed"]) systemItem = UITabBarSystemItemMostViewed;
        if (systemItem != -1)
            item = [[UITabBarItem alloc] initWithTabBarSystemItem:systemItem tag:tag];
    }
    
    if (item == nil) {
        NSLog(@"Creating with custom image and title");
        item = [[UITabBarItem alloc] initWithTitle:title image:[UIImage imageNamed:imageName] tag:tag];
    }

    if ([options objectForKey:@"badge"])
        item.badgeValue = [options objectForKey:@"badge"];
    
    [tabBarItems setObject:item forKey:name];
	[item release];
}

/**
 * Update an existing tab bar item to change its badge value.
 * @brief update the badge value on an existing tab bar item
 * @param arguments Parameters used to identify the tab bar item to update
 *  -# \c name internal name used to represent this item when it was created
 * @param options Options for customizing the individual tab item
 *  - \c badge value to display in the optional circular badge on the item; if nil or unspecified, the badge will be hidden
 */
- (void)updateTabBarItem:(NSArray*)arguments withDict:(NSDictionary*)options
{
    if (!tabBar)
        [self createTabBar:nil withDict:nil];

    NSString  *name = [arguments objectAtIndex:0];
    UITabBarItem *item = [tabBarItems objectForKey:name];
    if (item)
        item.badgeValue = [options objectForKey:@"badge"];
}

/**
 * Show previously created items on the tab bar
 * @brief show a list of tab bar items
 * @param arguments the item names to be shown
 * @param options dictionary of options, notable options including:
 *  - \c animate indicates that the items should animate onto the tab bar
 * @see createTabBarItem
 * @see createTabBar
 */
- (void)showTabBarItems:(NSArray*)arguments withDict:(NSDictionary*)options
{
    if (!tabBar)
        [self createTabBar:nil withDict:nil];
    
    int i, count = [arguments count];
    NSMutableArray *items = [[NSMutableArray alloc] initWithCapacity:count];
    for (i = 0; i < count; i++) {
        NSString *itemName = [arguments objectAtIndex:i];
        UITabBarItem *item = [tabBarItems objectForKey:itemName];
        if (item)
            [items addObject:item];
    }
    
    BOOL animateItems = YES;
    if ([options objectForKey:@"animate"])
        animateItems = [(NSString*)[options objectForKey:@"animate"] boolValue];
    [tabBar setItems:items animated:animateItems];
	[items release];
}

/**
 * Manually select an individual tab bar item, or nil for deselecting a currently selected tab bar item.
 * @brief manually select a tab bar item
 * @param arguments the name of the tab bar item to select
 * @see createTabBarItem
 * @see showTabBarItems
 */
- (void)selectTabBarItem:(NSArray*)arguments withDict:(NSDictionary*)options
{
    if (!tabBar)
        [self createTabBar:nil withDict:nil];

    NSString *itemName = [arguments objectAtIndex:0];
    UITabBarItem *item = [tabBarItems objectForKey:itemName];
    if (item)
        tabBar.selectedItem = item;
    else
        tabBar.selectedItem = nil;
}

/*
 * - <b>Tool Buttons</b>
 *   - toolButton:Done
 *   - toolButton:Cancel
 *   - toolButton:Edit
 *   - toolButton:Save
 *   - toolButton:Add
 *   - toolButton:FlexibleSpace
 *   - toolButton:FixedSpace
 *   - toolButton:Compose
 *   - toolButton:Reply
 *   - toolButton:Action
 *   - toolButton:Organize
 *   - toolButton:Bookmarks
 *   - toolButton:Search
 *   - toolButton:Refresh
 *   - toolButton:Stop
 *   - toolButton:Camera
 *   - toolButton:Trash
 *   - toolButton:Play
 *   - toolButton:Pause
 *   - toolButton:Rewind
 *   - toolButton:FastForward
 */
/*
-(UIBarButtonSystemItem) getSystemItemFromString:(NSString*)imageName
{
    if ([[imageName substringWithRange:NSMakeRange(0, 10)] isEqualTo:@"tabButton:"]) {
        NSLog(@"Tab button!!");
        if ([imageName isEqualTo:@"tabButton:More"])       return UITabBarSystemItemMore;
        if ([imageName isEqualTo:@"tabButton:Favorites"])  return UITabBarSystemItemFavorites;
        if ([imageName isEqualTo:@"tabButton:Featured"])   return UITabBarSystemItemFeatured;
        if ([imageName isEqualTo:@"tabButton:TopRated"])   return UITabBarSystemItemTopRated;
        if ([imageName isEqualTo:@"tabButton:Recents"])    return UITabBarSystemItemRecents;
        if ([imageName isEqualTo:@"tabButton:Contacts"])   return UITabBarSystemItemContacts;
        if ([imageName isEqualTo:@"tabButton:History"])    return UITabBarSystemItemHistory;
        if ([imageName isEqualTo:@"tabButton:Bookmarks"])  return UITabBarSystemItemBookmarks;
        if ([imageName isEqualTo:@"tabButton:Search"])     return UITabBarSystemItemSearch;
        if ([imageName isEqualTo:@"tabButton:Downloads"])  return UITabBarSystemItemDownloads;
        if ([imageName isEqualTo:@"tabButton:MostRecent"]) return UITabBarSystemItemMostRecent;
        if ([imageName isEqualTo:@"tabButton:MostViewed"]) return UITabBarSystemItemMostViewed;
        NSLog(@"Couldn't figure out what it was");
        return -1;
    }
    else if ([[imageName substringWithRange:NSMakeRange(0, 11)] isEqualTo:@"toolButton:"]) {
        NSLog(@"Tool button!!");
        if ([imageName isEqualTo:@"toolButton:Done"])          return UIBarButtonSystemItemDone;
        if ([imageName isEqualTo:@"toolButton:Cancel"])        return UIBarButtonSystemItemCancel;
        if ([imageName isEqualTo:@"toolButton:Edit"])          return UIBarButtonSystemItemEdit;
        if ([imageName isEqualTo:@"toolButton:Save"])          return UIBarButtonSystemItemSave;
        if ([imageName isEqualTo:@"toolButton:Add"])           return UIBarButtonSystemItemAdd;
        if ([imageName isEqualTo:@"toolButton:FlexibleSpace"]) return UIBarButtonSystemItemFlexibleSpace;
        if ([imageName isEqualTo:@"toolButton:FixedSpace"])    return UIBarButtonSystemItemFixedSpace;
        if ([imageName isEqualTo:@"toolButton:Compose"])       return UIBarButtonSystemItemCompose;
        if ([imageName isEqualTo:@"toolButton:Reply"])         return UIBarButtonSystemItemReply;
        if ([imageName isEqualTo:@"toolButton:Action"])        return UIBarButtonSystemItemAction;
        if ([imageName isEqualTo:@"toolButton:Organize"])      return UIBarButtonSystemItemOrganize;
        if ([imageName isEqualTo:@"toolButton:Bookmarks"])     return UIBarButtonSystemItemBookmarks;
        if ([imageName isEqualTo:@"toolButton:Search"])        return UIBarButtonSystemItemSearch;
        if ([imageName isEqualTo:@"toolButton:Refresh"])       return UIBarButtonSystemItemRefresh;
        if ([imageName isEqualTo:@"toolButton:Stop"])          return UIBarButtonSystemItemStop;
        if ([imageName isEqualTo:@"toolButton:Camera"])        return UIBarButtonSystemItemCamera;
        if ([imageName isEqualTo:@"toolButton:Trash"])         return UIBarButtonSystemItemTrash;
        if ([imageName isEqualTo:@"toolButton:Play"])          return UIBarButtonSystemItemPlay;
        if ([imageName isEqualTo:@"toolButton:Pause"])         return UIBarButtonSystemItemPause;
        if ([imageName isEqualTo:@"toolButton:Rewind"])        return UIBarButtonSystemItemRewind;
        if ([imageName isEqualTo:@"toolButton:FastForward"])   return UIBarButtonSystemItemFastForward;
        return -1;
    } else {
        return -1;
    }
}
*/

- (void)tabBar:(UITabBar *)tabBar didSelectItem:(UITabBarItem *)item
{
    NSString * jsCallBack = [NSString stringWithFormat:@"uicontrols.tabBarItemSelected(%d);", item.tag];    
    [webView stringByEvaluatingJavaScriptFromString:jsCallBack];
}

/*********************************************************************************/
- (void)createToolBar:(NSArray*)arguments withDict:(NSDictionary*)options
{
    CGFloat height   = 39.0f;
    BOOL atTop       = YES;
    UIBarStyle style = UIBarStyleDefault;

    NSDictionary* toolBarSettings = [settings objectForKey:@"ToolBarSettings"];
    if (toolBarSettings) {
        if ([toolBarSettings objectForKey:@"height"])
            height = [[toolBarSettings objectForKey:@"height"] floatValue];
        if ([toolBarSettings objectForKey:@"position"])
            atTop  = [[toolBarSettings objectForKey:@"position"] isEqualToString:@"top"];
        
        NSString *styleStr = [toolBarSettings objectForKey:@"style"];
        if ([styleStr isEqualToString:@"Default"])
            style = UIBarStyleDefault;
        else if ([styleStr isEqualToString:@"BlackOpaque"])
            style = UIBarStyleBlackOpaque;
        else if ([styleStr isEqualToString:@"BlackTranslucent"])
            style = UIBarStyleBlackTranslucent;
    }

    CGRect webViewBounds = webView.bounds;
    CGRect toolBarBounds = CGRectMake(
                              webViewBounds.origin.x,
                              webViewBounds.origin.y,
                              webViewBounds.size.width,
                              height
                              );
    webViewBounds = CGRectMake(
                               webViewBounds.origin.x,
                               webViewBounds.origin.y + height,
                               webViewBounds.size.width,
                               webViewBounds.size.height - height
                               );
    toolBar = [[UIToolbar alloc] initWithFrame:toolBarBounds];
    [toolBar sizeToFit];
    toolBar.hidden                 = NO;
    toolBar.multipleTouchEnabled   = NO;
    toolBar.autoresizesSubviews    = YES;
    toolBar.userInteractionEnabled = YES;
    toolBar.barStyle               = style;

    [toolBar setFrame:toolBarBounds];
    [webView setFrame:webViewBounds];

    [self.webView.superview addSubview:toolBar];
}

/*
- (void)createToolBarButton:(NSArray*)arguments withDict:(NSDictionary*)options
{
}
 */
/*
- (void)createToolBarItem:(NSArray*)arguments withDict:(NSDictionary*)options
{
    if (!toolBar)
        [self createToolBar:nil options:nil];
    
    NSString  *name  = [arguments objectAtIndex:0];
    NSString  *title = [arguments objectAtIndex:1];
    NSString  *style = [arguments objectAtIndex:2];
    UIBarButtonItemStyle styleRef = UIBarButtonItemStylePlain;
    if ([style isEqualTo:@"plain"])
        styleRef = UIBarButtonItemStylePlain;
    else if ([style isEqualTo:@"border"])
        styleRef = UIBarButtonItemStyleBordered;
    else if ([style isEqualTo:
        

    UIBarButtonItem *item = [[UIBarButtonItem alloc] initWithTitle:title style:styleRef target:self action:@selector(clickedToolBarTitle)];
    [toolBarItems setObject:item forKey:name];
}
*/
 
- (void)setToolBarTitle:(NSArray*)arguments withDict:(NSDictionary*)options
{
    if (!toolBar)
        [self createToolBar:nil withDict:nil];

    NSString *title = [arguments objectAtIndex:0];
    if (!toolBarTitle) {
        toolBarTitle = [[UIBarButtonItem alloc] initWithTitle:title style:UIBarButtonItemStylePlain target:self action:@selector(toolBarTitleClicked)];
    } else {
        toolBarTitle.title = title;
    }

    UIBarButtonItem *space1 = [[UIBarButtonItem alloc] initWithBarButtonSystemItem:UIBarButtonSystemItemFlexibleSpace target:self action:nil];
    UIBarButtonItem *space2 = [[UIBarButtonItem alloc] initWithBarButtonSystemItem:UIBarButtonSystemItemFlexibleSpace target:self action:nil];
    NSArray *items = [[NSArray alloc] initWithObjects:space1, toolBarTitle, space2, nil];
	[space1 release];
	[space2 release];
	
    [toolBar setItems:items];
	[items release];
}

- (void)toolBarTitleClicked
{
    NSLog(@"Toolbar clicked");
}

- (void)dealloc
{
    if (tabBar)
        [tabBar release];
    [super dealloc];
}

@end
