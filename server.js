var fs = require('fs');

var prompt = require('prompt');

var xml2js = require('xml2js');

var parseString = require('xml2js').parseString;

function escapeRegExp(str) {
    return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
}

function replaceAll(str, find, replace) {
  return str.replace(new RegExp(escapeRegExp(find), 'g'), replace);
}

prompt.start();


var schema= {
    properties: {
          myfile: {
            description : 'Introduce la ruta del proyecto a actualizar a 2.18',
            required: true,
            type: 'string'
          }
    }
};

  prompt.get(schema, function (err, theparams) {
    if (err) { console.log(err); }

    fs.readFile(theparams.myfile, 'utf8', function (err,data) {
      if (err) {
        return console.log(err);
      }




    parseString(data, function (err, result) {

        result.qgis.projectlayers[0].maplayer.forEach(function(maplayer){


          if (maplayer.datasource[0].toLowerCase().indexOf('service=') > -1){

            var params=[];

            maplayer.datasource[0].replace(/[?&]+([^=&]+)=([^&]*)/gi,function(str,key,value){
                params.push({key:key,value:value});
            });

            //maplayer.datasource[0] = "restrictToRequestBBOX='1'";
            var s = maplayer.datasource[0];
            maplayer.datasource[0]='';

            params.forEach(function(param){

                switch (param.key.toLowerCase())
                {
                   case "version":
                        break;
                   case "request":
                        break;
                   case "service":
                        break;
                   case "map":
                        maplayer.datasource[0] += ' url=\'' + s.split('?')[0] + '?map=' + replaceAll(param.value, '\\', '\\\\') + '\'';
                       break;

                   default:
                        maplayer.datasource[0] += ' ' + param.key.toLowerCase() + '=\'' + param.value + '\'';
                }
            });

            maplayer.datasource[0] += " restrictToRequestBBOX='1'";

          }
          //console.log( maplayer.datasource[0]);
        });





       var builder = new xml2js.Builder();
        var xml = builder.buildObject(result);


        fs.writeFile(theparams.myfile.substring(0, theparams.myfile.lastIndexOf("\\")) +'\\' + theparams.myfile.replace(/^.*[\\\/]/, '').slice(0, -4) + '_2.18.qgs', xml, 'utf8', function (err) {
             if (err) return console.log(err);
          });


        });


    });








  });




