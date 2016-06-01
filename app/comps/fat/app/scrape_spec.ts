// https://rawgit.com/postmanlabs/postman-chrome-extension-legacy/master/chrome/js/httpheaders.js
let standardHeaders = ['Accept-Ranges', 'Access-Control-Allow-Credentials', 'Access-Control-Allow-Headers', 'Access-Control-Allow-Origin', 'Access-Control-Allow-Methods', 'Access-Control-Expose-Headers', 'Access-Control-Max-Age', 'Access-Control-Request-Method', 'Access-Control-Request-Headers', 'Age', 'Allow', 'Connection', 'Content-Encoding', 'Content-Language', 'Content-Location', 'Content-Md5', 'Content-Disposition', 'Content-Range', 'Etag', 'Expires', 'Last-Modified', 'Link', 'Location', 'P3p', 'Proxy-Authenticate', 'Refresh', 'Retry-After', 'Server', 'Set-Cookie', 'Strict-Transport-Security', 'Trailer', 'Transfer-Encoding', 'Vary', 'Www-Authenticate', 'X-Forwarded-For', 'X-Frame-Options', 'X-Xss-Protection', 'X-Content-Type-Options', 'X-Forwarded-Proto', 'X-Powered-By'];
let chromeHeaders = ['Accept', 'Accept-Charset', 'Accept-Encoding', 'Accept-Language', 'Authorization', 'Cache-Control', 'Connection', 'Cookie', 'Content-Length', 'Content-MD5', 'Content-Type', 'Date', 'Expect', 'From', 'Host', 'If-Match', 'If-Modified-Since', 'If-None-Match', 'If-Range', 'If-Unmodified-Since', 'Max-Forwards', 'Pragma', 'Proxy-Authorization', 'Range', 'Referer', 'TE', 'Upgrade', 'User-Agent', 'Via', 'Warning', 'X-Requested-With', 'X-Do-Not-Track', 'DNT'];
let headers = standardHeaders.concat(chromeHeaders);
// http://camendesign.com/code/uth4_mime-type/mime-types.php
// let mimeTypes = ['application/andrew-inset','application/atom+xml','application/atomcat+xml','application/atomsvc+xml','application/ccxml+xml','application/davmount+xml','application/ecmascript','application/font-tdpfr','application/hyperstudio','application/javascript','application/json','application/mac-binhex40','application/mac-compactpro','application/marc','application/mathematica','application/mathml+xml','application/mbox','application/mediaservercontrol+xml','application/mp4','application/msword','application/mxf','application/octet-stream','application/oda','application/ogg','application/pdf','application/pgp-encrypted','application/pgp-signature','application/pics-rules','application/pkcs10','application/pkcs7-mime','application/pkcs7-signature','application/pkix-cert','application/pkix-crl','application/pkix-pkipath','application/pkixcmp','application/pls+xml','application/postscript','application/prs.cww','application/rdf+xml','application/reginfo+xml','application/relax-ng-compact-syntax','application/resource-lists+xml','application/rls-services+xml','application/rsd+xml','application/rss+xml','application/rtf','application/sbml+xml','application/sdp','application/set-payment-initiation','application/set-registration-initiation','application/shf+xml','application/smil+xml','application/srgs','application/srgs+xml','application/ssml+xml','application/vnd.3gpp.pic-bw-large','application/vnd.3gpp.pic-bw-small','application/vnd.3gpp.pic-bw-var','application/vnd.3m.post-it-notes','application/vnd.accpac.simply.aso','application/vnd.accpac.simply.imp','application/vnd.acucobol','application/vnd.acucorp','application/vnd.adobe.xdp+xml','application/vnd.adobe.xfdf','application/vnd.amiga.ami','application/vnd.anser-web-certificate-issue-initiation','application/vnd.anser-web-funds-transfer-initiation','application/vnd.antix.game-component','application/vnd.apple.installer+xml','application/vnd.audiograph','application/vnd.blueice.multipass','application/vnd.bmi','application/vnd.businessobjects','application/vnd.chemdraw+xml','application/vnd.chipnuts.karaoke-mmd','application/vnd.cinderella','application/vnd.claymore','application/vnd.clonk.c4group','application/vnd.commonspace','application/vnd.contact.cmsg','application/vnd.cosmocaller','application/vnd.crick.clicker','application/vnd.crick.clicker.keyboard','application/vnd.crick.clicker.palette','application/vnd.crick.clicker.template','application/vnd.crick.clicker.wordbank','application/vnd.criticaltools.wbs+xml','application/vnd.ctc-posml','application/vnd.cups-ppd','application/vnd.curl','application/vnd.data-vision.rdz','application/vnd.dna','application/vnd.dolby.mlp','application/vnd.dpgraph','application/vnd.dreamfactory','application/vnd.ecowin.chart','application/vnd.enliven','application/vnd.epson.esf','application/vnd.epson.msf','application/vnd.epson.quickanime','application/vnd.epson.salt','application/vnd.epson.ssf','application/vnd.eszigno3+xml','application/vnd.ezpix-album','application/vnd.ezpix-package','application/vnd.fdf','application/vnd.flographit','application/vnd.fluxtime.clip','application/vnd.framemaker','application/vnd.frogans.fnc','application/vnd.frogans.ltf','application/vnd.fsc.weblaunch','application/vnd.fujitsu.oasys','application/vnd.fujitsu.oasys2','application/vnd.fujitsu.oasys3','application/vnd.fujitsu.oasysgp','application/vnd.fujitsu.oasysprs','application/vnd.fujixerox.ddd','application/vnd.fujixerox.docuworks','application/vnd.fujixerox.docuworks.binder','application/vnd.fuzzysheet','application/vnd.genomatix.tuxedo','application/vnd.google-earth.kml+xml','application/vnd.google-earth.kmz','application/vnd.grafeq','application/vnd.groove-account','application/vnd.groove-help','application/vnd.groove-identity-message','application/vnd.groove-injector','application/vnd.groove-tool-message','application/vnd.groove-tool-template','application/vnd.groove-vcard','application/vnd.handheld-entertainment+xml','application/vnd.hbci','application/vnd.hhe.lesson-player','application/vnd.hp-hpgl','application/vnd.hp-hpid','application/vnd.hp-hps','application/vnd.hp-jlyt','application/vnd.hp-pcl','application/vnd.hp-pclxl','application/vnd.hzn-3d-crossword','application/vnd.ibm.minipay','application/vnd.ibm.modcap','application/vnd.ibm.rights-management','application/vnd.ibm.secure-container','application/vnd.igloader','application/vnd.immervision-ivp','application/vnd.immervision-ivu','application/vnd.intercon.formnet','application/vnd.intu.qbo','application/vnd.intu.qfx','application/vnd.ipunplugged.rcprofile','application/vnd.irepository.package+xml','application/vnd.is-xpr','application/vnd.jam','application/vnd.jcp.javame.midlet-rms','application/vnd.jisp','application/vnd.kahootz','application/vnd.kde.karbon','application/vnd.kde.kchart','application/vnd.kde.kformula','application/vnd.kde.kivio','application/vnd.kde.kontour','application/vnd.kde.kpresenter','application/vnd.kde.kspread','application/vnd.kde.kword','application/vnd.kenameaapp','application/vnd.kidspiration','application/vnd.kinar','application/vnd.koan','application/vnd.llamagraphics.life-balance.desktop','application/vnd.llamagraphics.life-balance.exchange+xml','application/vnd.lotus-1-2-3','application/vnd.lotus-approach','application/vnd.lotus-freelance','application/vnd.lotus-notes','application/vnd.lotus-organizer','application/vnd.lotus-screencam','application/vnd.lotus-wordpro','application/vnd.macports.portpkg','application/vnd.mcd','application/vnd.medcalcdata','application/vnd.mediastation.cdkey','application/vnd.mfer','application/vnd.mfmp','application/vnd.micrografx.flo','application/vnd.micrografx.igx','application/vnd.mif','application/vnd.mobius.daf','application/vnd.mobius.dis','application/vnd.mobius.mbk','application/vnd.mobius.mqy','application/vnd.mobius.msl','application/vnd.mobius.plc','application/vnd.mobius.txf','application/vnd.mophun.application','application/vnd.mophun.certificate','application/vnd.mozilla.xul+xml','application/vnd.ms-artgalry','application/vnd.ms-asf','application/vnd.ms-cab-compressed','application/vnd.ms-excel','application/vnd.ms-fontobject','application/vnd.ms-htmlhelp','application/vnd.ms-ims','application/vnd.ms-lrm','application/vnd.ms-powerpoint','application/vnd.ms-project','application/vnd.ms-works','application/vnd.ms-wpl','application/vnd.ms-xpsdocument','application/vnd.mseq','application/vnd.musician','application/vnd.neurolanguage.nlu','application/vnd.noblenet-directory','application/vnd.noblenet-sealer','application/vnd.noblenet-web','application/vnd.nokia.n-gage.data','application/vnd.nokia.n-gage.symbian.install','application/vnd.nokia.radio-preset','application/vnd.nokia.radio-presets','application/vnd.novadigm.edm','application/vnd.novadigm.edx','application/vnd.novadigm.ext','application/vnd.oasis.opendocument.chart','application/vnd.oasis.opendocument.chart-template','application/vnd.oasis.opendocument.formula','application/vnd.oasis.opendocument.formula-template','application/vnd.oasis.opendocument.graphics','application/vnd.oasis.opendocument.graphics-template','application/vnd.oasis.opendocument.image','application/vnd.oasis.opendocument.image-template','application/vnd.oasis.opendocument.presentation','application/vnd.oasis.opendocument.presentation-template','application/vnd.oasis.opendocument.spreadsheet','application/vnd.oasis.opendocument.spreadsheet-template','application/vnd.oasis.opendocument.text','application/vnd.oasis.opendocument.text-master','application/vnd.oasis.opendocument.text-template','application/vnd.oasis.opendocument.text-web','application/vnd.olpc-sugar','application/vnd.oma.dd2+xml','application/vnd.openofficeorg.extension','application/vnd.osgi.dp','application/vnd.palm','application/vnd.pg.format','application/vnd.pg.osasli','application/vnd.picsel','application/vnd.pocketlearn','application/vnd.powerbuilder6','application/vnd.previewsystems.box','application/vnd.proteus.magazine','application/vnd.publishare-delta-tree','application/vnd.pvi.ptid1','application/vnd.quark.quarkxpress','application/vnd.recordare.musicxml','application/vnd.rn-realmedia','application/vnd.seemail','application/vnd.sema','application/vnd.semd','application/vnd.semf','application/vnd.shana.informed.formdata','application/vnd.shana.informed.formtemplate','application/vnd.shana.informed.interchange','application/vnd.shana.informed.package','application/vnd.simtech-mindmapper','application/vnd.smaf','application/vnd.solent.sdkm+xml','application/vnd.spotfire.dxp','application/vnd.spotfire.sfs','application/vnd.sus-calendar','application/vnd.svd','application/vnd.syncml+xml','application/vnd.syncml.dm+wbxml','application/vnd.syncml.dm+xml','application/vnd.tao.intent-module-archive','application/vnd.tmobile-livetv','application/vnd.trid.tpt','application/vnd.triscape.mxs','application/vnd.trueapp','application/vnd.ufdl','application/vnd.uiq.theme','application/vnd.umajin','application/vnd.unity','application/vnd.uoml+xml','application/vnd.vcx','application/vnd.visio','application/vnd.visionary','application/vnd.vsf','application/vnd.wap.wbxml','application/vnd.wap.wmlc','application/vnd.wap.wmlscriptc','application/vnd.webturbo','application/vnd.wordperfect','application/vnd.wqd','application/vnd.wt.stf','application/vnd.xara','application/vnd.xfdl','application/vnd.yamaha.hv-dic','application/vnd.yamaha.hv-script','application/vnd.yamaha.hv-voice','application/vnd.yamaha.smaf-audio','application/vnd.yamaha.smaf-phrase','application/vnd.yellowriver-custom-menu','application/vnd.zzazz.deck+xml','application/voicexml+xml','application/winhlp','application/wsdl+xml','application/wspolicy+xml','application/x-ace-compressed','application/x-bcpio','application/x-bittorrent','application/x-bzip','application/x-bzip2','application/x-cdlink','application/x-chat','application/x-chess-pgn','application/x-cpio','application/x-csh','application/x-director','application/x-dvi','application/x-futuresplash','application/x-gtar','application/x-hdf','application/x-java-jnlp-file','application/x-latex','application/x-ms-wmd','application/x-ms-wmz','application/x-msaccess','application/x-msbinder','application/x-mscardfile','application/x-msclip','application/x-msdownload','application/x-msmediaview','application/x-msmetafile','application/x-msmoney','application/x-mspublisher','application/x-msschedule','application/x-msterminal','application/x-mswrite','application/x-netcdf','application/x-pkcs12','application/x-pkcs7-certificates','application/x-pkcs7-certreqresp','application/x-rar-compressed','application/x-sh','application/x-shar','application/x-shockwave-flash','application/x-stuffit','application/x-stuffitx','application/x-sv4cpio','application/x-sv4crc','application/x-tar','application/x-tcl','application/x-tex','application/x-texinfo','application/x-ustar','application/x-wais-source','application/x-x509-ca-cert','application/xenc+xml','application/xhtml+xml','application/xml','application/xml-dtd','application/xop+xml','application/xslt+xml','application/xspf+xml','application/xv+xml','application/zip','audio/basic','audio/midi','audio/mp4','audio/mp4a-latm','audio/mpeg','audio/vnd.digital-winds','audio/vnd.lucent.voice','audio/vnd.nuera.ecelp4800','audio/vnd.nuera.ecelp7470','audio/vnd.nuera.ecelp9600','audio/wav','audio/x-aiff','audio/x-mpegurl','audio/x-ms-wax','audio/x-ms-wma','audio/x-pn-realaudio','audio/x-pn-realaudio-plugin','chemical/x-cdx','chemical/x-cif','chemical/x-cmdf','chemical/x-cml','chemical/x-csml','chemical/x-xyz','image/bmp','image/cgm','image/g3fax','image/gif','image/ief','image/jp2','image/jpeg','image/pict','image/png','image/prs.btif','image/svg+xml','image/tiff','image/vnd.adobe.photoshop','image/vnd.djvu','image/vnd.dwg','image/vnd.dxf','image/vnd.fastbidsheet','image/vnd.fpx','image/vnd.fst','image/vnd.fujixerox.edmics-mmr','image/vnd.fujixerox.edmics-rlc','image/vnd.microsoft.icon','image/vnd.ms-modi','image/vnd.net-fpx','image/vnd.wap.wbmp','image/vnd.xiff','image/x-cmu-raster','image/x-cmx','image/x-macpaint','image/x-pcx','image/x-portable-anymap','image/x-portable-bitmap','image/x-portable-graymap','image/x-portable-pixmap','image/x-quicktime','image/x-rgb','image/x-xbitmap','image/x-xpixmap','image/x-xwindowdump','message/rfc822','model/iges','model/mesh','model/vnd.dwf','model/vnd.gdl','model/vnd.gtw','model/vnd.mts','model/vnd.vtu','model/vrml','text/calendar','text/css','text/csv','text/html','text/plain','text/prs.lines.tag','text/richtext','text/sgml','text/tab-separated-values','text/troff','text/uri-list','text/vnd.fly','text/vnd.fmi.flexstor','text/vnd.in3d.3dml','text/vnd.in3d.spot','text/vnd.sun.j2me.app-descriptor','text/vnd.wap.wml','text/vnd.wap.wmlscript','text/x-asm','text/x-c','text/x-fortran','text/x-pascal','text/x-java-source','text/x-setext','text/x-uuencode','text/x-vcalendar','text/x-vcard','video/3gpp','video/3gpp2','video/h261','video/h263','video/h264','video/jpeg','video/jpm','video/mj2','video/mp4','video/mpeg','video/quicktime','video/vnd.fvt','video/vnd.mpegurl','video/vnd.vivo','video/x-dv','video/x-fli','video/x-ms-asf','video/x-ms-wm','video/x-ms-wmv','video/x-ms-wmx','video/x-ms-wvx','video/x-msvideo','video/x-sgi-movie','x-conference/x-cooltalk'];
// ^ okay for an auto-complete list of suggestions, maybe not for an enum error message...
let mimeTypes = ['application/json','application/x-www-form-urlencoded','multipart/form-data','text/html'];

export let fetch_spec: Front.Schema = {
  type: 'object',
  required: ['urls', 'headers'],
  properties: {
    'urls': {
      type: 'string',
      format: 'url',
      required: true,
      'x-template': 'textarea',
      description: 'the URLs to scrape and extract, delimited with line breaks (`\\n`)',
    },
    'headers': {
      description: 'Request Headers',
      type: 'object',
      properties: {
        'Content-Type': {
          type: 'string',
          suggestions: mimeTypes,
        },
      },
      additionalProperties: {
        type: 'string',
        required: true,
        name: 'header value',
        description: 'any string',
      },
      'x-keys': {
        suggestions: headers,
      },
    },
  },
};

// parselet values should have their `selector`, `type` and `attribute` serialized into a single string!

let selector = {
  type: 'string',
  // format: 'json',
  required: true,
  name: 'floki selector',
  description: 'use CSS selectors',
  // description: "use e.g. `a@src` to get a URL's `src` attribute, `a` to get its text, `a@` to get its inner html, or `a@@` to get its outer html.",
};

let parselet = {
  description: 'json parselet',
  type: 'object',
  // additionalProperties: selector,
  additionalProperties: {
    type: 'object',
    properties: {
      'selector': selector,
      'type': {
        type: 'string',
        enum: [
          'text',
          'attribute',
          'inner html',
          'outer html',
          'array',
        ],
        // ^ I need these to be labels, actual values being '', '@', '@', '@@'... uh-oh, can't have two identical values?
        // description: "`attribute -> src` makes `a@src`, `text` makes `a`, `inner html` gives `a@`, `outer html` gives `a@@`.",
      },
      'attribute': {
        type: 'string',
        'x-bindings': {
          // styles: {},
          // classes: {},
          attributes: {
            hidden: `this.nav('../type', path) != 'attribute'`,
          },
        },
      },
    },
    additionalProperties: false,
  },
  minProperties: 1,
  'x-bindings': {
    attributes: {
      hidden: `this.nav('../processor', path) != 'parselet'`,
    },
  },
};

let nested = _.assign(_.clone(parselet), {
  'x-bindings': {
    attributes: {
      hidden: `this.nav('../type', path) != 'array'`,
    },
  },
});

nested  .additionalProperties.properties.parselet = nested;
parselet.additionalProperties.properties.parselet = nested;

export let process_spec: Front.Schema = {
  type: 'object',
  required: ['processor', 'parselet', 'transformer'],
  properties: {
    'processor': {
      type: 'string',
      enum: [
        'none',
        'parselet',
        'transformer',
      ],
      default: 'none',
    },
    'parselet': parselet,
    'transformer': {
      type: 'string',
      default: `(json) => JSON.parse(json)`,
      'x-template': 'textarea',
      'x-bindings': {
        attributes: {
          hidden: `this.nav('../processor', path) != 'transformer'`,
        },
      },
    },
  },
};
