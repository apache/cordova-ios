/*
 * Device Resolution details
 */
var deviceResolutionList = {
	'240x320'	: 	{
		'default'			:	'portrait',
		'orientation'		:	true,
		'homeScreenSupport'	:	false,
		'fontSize'			:	'12px',
		'portrait'	:	{
			'style'	:	{
				'layout'	:	{
					'backgroundImage'	: 'url(preview/images/device/240x320/Portrait.png)',
					'width'				: '600px',
					'height'			: '536px'
					},
				'display':	{
					'width'		:	'240px',
					'height'	:	'320px',
					'paddingTop':	'108px',
					'marginLeft': 	'auto'				
					},
				'widget':	{
					'width'		:	240,
					'height'	:	320,
					'float'		: 	'left'
					},
				'menu'	:	{
					'width'		:	240,
					'height'	:	30,
					'float'		: 	'right',
					'optionKeysheight'	:	24
					},
				'softkeys'	:	{
					'width'	:	'240px',
					'height':	'50px',
					'left'	:	'0px',
					'top'	:	'0px',
					'position':	'relative'
				},
				'softkeysImg' : {
					'width'	:	"50%",
					'height':	"100%"
				}
			}
		},
		'landscape'	:	{
			'style'	:	{
				'layout'	:	{
					'backgroundImage'	: 'url(preview/images/device/240x320/Landscape.png)',
					'width'				: '848px',
					'height'			: '408px'
					},
				'display':	{
					'width'		:	'320px',
					'height'	:	'240px',
					'paddingTop':	'84px',
					'marginLeft': 	'auto'				
					},
				'widget':	{
					'width'		:	320,
					'height'	:	240,
					'float'		: 	'left'
					},
				'menu'	:	{
					'width'		:	320,
					'height'	:	30,
					'float'		: 	'right',
					'optionKeysheight'	:	24
					},
				'softkeys'	:	{
					'width'	:	'50px',
					'height':	'240px',
					'left'	:	'200px',
					'top'	:	'-250px',
					'position':	'relative'
				},	
				'softkeysImg' : {
					'width'	:	"100%",
					'height':	"50%"
				}
			}
		}
	},

	'320x240'	: 	{
		'default'			:	'portrait',
		'orientation'		:	true,
		'homeScreenSupport'	:	false,
		'fontSize'			:	'12px',
		'portrait'	:	{
			'style'	:	{
				'layout'	:	{
					'backgroundImage'	: 'url(preview/images/device/320x240/Portrait.png)',
					'width'				: '640px',
					'height'			: '472px'
					},
				'display':	{
					'width'		:	'320px',
					'height'	:	'240px',
					'paddingTop':	'113px',
					'marginLeft': 	'163px'				
					},
				'widget':	{
					'width'		:	320,
					'height'	:	240,
					'float'		: 	'left'
					},
				'menu'	:	{
					'width'		:	320,
					'height'	:	30,
					'float'		: 	'right',
					'optionKeysheight'	:	24
					},
				'softkeys'	:	{
					'width'	:	'320px',
					'height':	'38px',
					'left'	:	'0px',
					'top'	:	'0px',
					'position':	'relative'
				},
				'softkeysImg' : {
					'width'	:	"50%",
					'height':	"100%"
				}
			}
		},
		'landscape'	:	{
			'style'	:	{
				'layout'	:	{
					'backgroundImage'	: 'url(preview/images/device/320x240/Landscape.png)',
					'width'				: '680px',
					'height'			: '472px'
					},
				'display':	{
					'width'		:	'240px',
					'height'	:	'320px',
					'paddingTop':	'76px',
					'marginLeft': 	'223px'				
					},
				'widget':	{
					'width'		:	240,
					'height'	:	320,
					'float'		: 	'left'
					},
				'menu'	:	{
					'width'		:	240,
					'height'	:	30,
					'float'		: 	'right',
					'optionKeysheight'	:	24
					},
				'softkeys'	:	{
					'width'	:	'30px',
					'height':	'320px',
					'left'	:	'150px',
					'top'	:	'-330px',
					'position':	'relative'
				},	
				'softkeysImg' : {
					'width'	:	"100%",
					'height':	"50%"
				}
			}
		}
	},

	'360x640'	: 	{
		'default'			:	'portrait',
		'orientation'		:	true,
		'homeScreenSupport'	:	true,
		'fontSize'			:	'12px',
		'portrait'	:	{
			'style'	:	{
				'layout'	:	{
					'backgroundImage'	: 'url(preview/images/device/360x640/Portrait.png)',
					'width'				: '678px',
					'height'			: '838px'
					},
				'display':	{
					'width'		:	'360px',
					'height'	:	'640px',
					'paddingTop':	'89px',
					'marginLeft': 	'158px'				
					},
				'widget':	{
					'width'		:	360,
					'height'	:	640,
					'float'		: 	'left'
					},
				'menu'	:	{
					'width'		:	360,
					'height'	:	30,
					'float'		: 	'right',
					'optionKeysheight'	:	24
					},
				'softkeys'	:	{
					'width'	:	'360px',
					'height':	'50px',
					'left'	:	'0px',
					'top'	:	'0px',
					'position':	'relative',
					'marginLeft' : '159px'
				},
				'softkeysImg' : {
					'width'	:	"50%",
					'height':	"100%"
				},
				'homeScreenDisplay':	{
					'width'		:	'306px',
					'height'	:	'76px'
				}
			}
		},
		'landscape'	:	{
			'style'	:	{
				'layout'	:	{
					'backgroundImage'	: 'url(preview/images/device/360x640/Landscape.png)',
					'width'				: '1054px',
					'height'			: '572px'
					},
				'display':	{
					'width'		:	'640px',
					'height'	:	'360px',
					'paddingTop':	'104px',
					'marginLeft': 	'206px'				
					},
				'widget':	{
					'width'		:	640,
					'height'	:	360,
					'float'		: 	'left'
					},
				'menu'	:	{
					'width'		:	640,
					'height'	:	30,
					'float'		: 	'right',
					'optionKeysheight'	:	24
					},
				'softkeys'	:	{
					'width'	:	'50px',
					'height':	'360px',
					'left'	:	'350px',
					'top'	:	'-370px',
					'position':	'relative',
					'marginLeft': 	'auto'	
				},	
				'softkeysImg' : {
					'width'	:	"100%",
					'height':	"50%"
				},
				'homeScreenDisplay':	{
					'width'		:	'306px',
					'height'	:	'76px'
				}
			}
		}
	},

	'800x352'	: 	{
		'default'			:	'landscape',
		'orientation'		:	false,
		'homeScreenSupport'	:	false,
		'fontSize'			:	'12px',
		'landscape'	:	{
			'style'	:	{
				'layout'	:	{
					'backgroundImage'	: 'url(preview/images/device/800x352/Landscape.png)',
					'width'				: '1180px',
					'height'			: '572px'
					},
				'display':	{
					'width'		:	'800px',
					'height'	:	'352px',
					'paddingTop':	'108px',
					'marginLeft': 	'190px'				
					},
				'widget':	{
					'width'		:	800,
					'height'	:	352,
					'float'		: 	'left'
					},
				'menu'	:	{
					'width'		:	800,
					'height'	:	30,
					'float'		: 	'right',
					'optionKeysheight'	:	24
					},
				'softkeys'	:	{
					'width'	:	'50px',
					'height':	'352px',
					'left'	:	'432px',
					'top'	:	'-364px',
					'position':	'relative',
					'marginLeft': 	'auto'	
				},	
				'softkeysImg' : {
					'width'	:	"100%",
					'height':	"50%"
				}
			}
		}
	}

};
