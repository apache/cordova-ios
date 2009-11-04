import os
from os.path import join, exists

PHONEGAP_LIB        = "phonegap.js"
PHONEGAP_COMPRESSED = "app.js"
APPNAME = "PhoneGap"

def CommandMakePhonegapJS(env, source, target):
    
    print target[0].path
    ft = open( target[0].path, 'wb' )
    
    for s in source:
        fs = open( s.path, 'rb')
        d = d = fs.read();
        while len(d) != 0:
            ft.write( d )
            d = fs.read();            
        
        fs.close()        
        
        ft.write( os.linesep )
        
    ft.close()
 
jssources = [
    "phonegap.js",
    "device.js",
]

javascripts = []
JSROOTPATH= "../javascripts"
for js in ["phonegap.js.base"]:
    continue
    baselib = join( JSROOTPATH, js )
    if exists( baselib ): 
        javascripts.append( baselib )    
        
for js in jssources:    
    iphonelib = join( JSROOTPATH, "maemo/%s" % js )
    if exists( iphonelib ): 
        javascripts.append( iphonelib )
    
Command( PHONEGAP_LIB, javascripts, CommandMakePhonegapJS )

# Compress javascripts
compress = "java -jar ../util/yuicompressor-2.4.2.jar --charset UTF-8 -o $TARGET $SOURCE"
Command( PHONEGAP_COMPRESSED, PHONEGAP_LIB, compress )

