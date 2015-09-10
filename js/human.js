/* 
*   Global Variables
*  All the variables the user need to set should be on the top
*  TODO: see if you can write an interpolation function and use it everywhere
*/
var img_path        = 'imgs/ixmas_daniel_cam1/img%04d.jpg';
var flow_path       = 'flow/ixmas_daniel_cam1/img%04d.jpg';
var nimages         = 500;              //TODO: This could be determined automatically    
var FPS             = 10;               // Playing speed; TODO: Provide UI to change it
var img_height      = 480;              // image height
var img_width       = 640;              // image width

// control_points are the keypoints
// control_attr are the attributes applied to control points in different states. 
// States are mouseover, interp (true), default (interp = false)
// interp is interpolation
var control_points  = ["head","neck","lsh","rsh","larm","rarm","lwr","rwr","ltor","rtor","lknee","rknee","lleg","rleg"];
var control_attr    = {"mouseover"  : {fill: "#FF8000", stroke: "none", opacity:0.5, r:10},
                       "interp"     : {fill: "#FF0000", stroke: "none", opacity:0.5, r:5 },
                       "default"    : {fill: "#00FF80", stroke: "none", opacity:0.5, r:5}};

var center_control_attr = {"mouseover"  : {fill: "#FF0000", stroke: "none", opacity:0.5, r:10},
                           "interp"     : {fill: "#00FF00", stroke: "none", opacity:0.5, r:5 },
                       	   "default"    : {fill: "#0000FF", stroke: "none", opacity:0.5, r:5}};

// Connections is where to draw the line to join the connections
var connections     =  ["head-neck","neck-lsh","neck-rsh","lsh-larm","rsh-rarm","larm-lwr","rarm-rwr","ltor-lknee","rtor-rknee","lknee-lleg","rknee-rleg"];
var connection_color= {"head-neck" : "hsb(.3, .75, .75)",
                       "neck-lsh"  : "hsb(.3, .75, .75)",
                       "neck-rsh"  : "hsb(.6, .75, .75)",
                       "lsh-larm"  : "hsb(.3, .75, .75)",
                       "rsh-rarm"  : "hsb(.6, .75, .75)",
                       "larm-lwr"  : "hsb(.3, .75, .75)",
                       "rarm-rwr"  : "hsb(.6, .75, .75)",
                       "ltor-lknee": "hsb(.3, .75, .75)",
                       "rtor-rknee": "hsb(.6, .75, .75)",
                       "lknee-lleg": "hsb(.3, .75, .75)",
                       "rknee-rleg": "hsb(.6, .75, .75)"};

//center point will be average of whatever control points we write in center_point seperated by "-"
var center_point  = "lsh-rsh-ltor-rtor";
    
// assigned when using random generation, take care the order should be same as control_points
var rand_coordinates ={};
    rand_coordinates.head = {x:305,y:125,interp:true};
    rand_coordinates.neck = {x:305,y:165,interp:true};
    rand_coordinates.lsh  = {x:265,y:165,interp:true};
    rand_coordinates.rsh  = {x:345,y:165,interp:true};
    rand_coordinates.larm = {x:265,y:205,interp:true};
    rand_coordinates.rarm = {x:345,y:205,interp:true};
    rand_coordinates.lwr  = {x:265,y:245,interp:true};
    rand_coordinates.rwr  = {x:345,y:245,interp:true};
    rand_coordinates.ltor = {x:285,y:255,interp:true};
    rand_coordinates.rtor = {x:325,y:255,interp:true};
    rand_coordinates.lknee= {x:285,y:285,interp:true};
    rand_coordinates.rknee= {x:325,y:285,interp:true};
    rand_coordinates.lleg = {x:285,y:315,interp:true};
    rand_coordinates.rleg = {x:325,y:315,interp:true};
// Beyond this no change should be required by the user

var r;							// variable to hold raphael element
var play;                       // this is set to stop the playing when paused or stopped
var current_image   = 0;        // the image we are looking at; the first one starts from zero #assumption
var show_image      = true;
var show_annotation = true;
var annotation      = []; 

// To have better play and pause functions; to wait for images to load. 
var is_image_loaded = false;
function image_loaded(){
  is_image_loaded = true;
}      

// create raphael element 
// we have to keep track of every svg element we create so that we can reorder it. 
r = Raphael("holder",img_width,img_height); 
    
// This function handles drawing of svg and dragging 
// Input : keypoints  is an array similar to data array in annotation
function draw_puppet(keypoints, color) {

// We draw all the line by moving(M) and drawing a line (L)
//function to generate path arrays
    function gen_path_array(str1,str2){
        return ["M", keypoints[str1].x, keypoints[str1].y, "L", keypoints[str2].x, keypoints[str2].y];
    }
        
    // draw connections
    var path = {};
    var curve = {} 
    function draw_connections(){
        connections.forEach( function(ele,idx){
            path[ele] = gen_path_array (ele.split("-")[0],ele.split("-")[1]);
        });
        connections.forEach( function (ele,idx){
            curve[ele] = r.path(path[ele]).attr({stroke: connection_color[ele]||Raphael.getColor(),"stroke-width": 4, "stroke-linecap": "round"});
        });
    }
        
    function redraw_connections(){
        connections.forEach( function(ele,idx){
            path[ele] = gen_path_array (ele.split("-")[0],ele.split("-")[1]);
        });
        connections.forEach( function (ele,idx){
            curve[ele].attr({path:path[ele]});
        });
        var t = center_point.split("-");
	    var avg_x = 0, avg_y = 0;
        for (var i=0;i<t.length;i++){
            avg_x = avg_x + keypoints[t[i]].x ;
            avg_y = avg_y + keypoints[t[i]].y ;     
        }
        avg_x = avg_x/t.length;
        avg_y = avg_y/t.length;

        center_control.attr({cx:avg_x, cy: avg_y});
    } 
    
    draw_connections();
    controls = r.set();
    
    for (var prop in keypoints){
        var attr = (keypoints[prop].interp)? control_attr["interp"]: control_attr["default"];
        controls.push(r.circle(keypoints[prop].x, keypoints[prop].y, 5).attr(attr));
        //console.log(prop);
    }    
    var t = center_point.split("-");
    var avg_x = 0, avg_y = 0;
    for (var i=0;i<t.length;i++){
        avg_x = avg_x + keypoints[t[i]].x ;
        avg_y = avg_y + keypoints[t[i]].y ;     
    }
    avg_x = avg_x/t.length;
    avg_y = avg_y/t.length;
    center_control = r.circle(avg_x,avg_y,5).attr(center_control_attr["interp"]);

    // set control listeners for all the points. 
    // This is a perfect example of why people call js a devil
    var base_id = controls[0].id;
    for (var i=0; i < controls.length; i++){
        controls[i].update = function (x, y) {
            var X = this.attr("cx") + x, Y = this.attr("cy") + y;
            keypoints[control_points[this.id-base_id]] = {x: X, y: Y, interp: false};
            this.attr({cx: X, cy: Y});
            this.attr(control_attr["default"]);
            redraw_connections();
            
		center_control.attr(center_control_attr["default"]);
        }
    }
    
    center_control.update = function (x,y){
        var p=0
        for (var prop in keypoints){
            keypoints[prop] = {x: keypoints[prop].x+x, y: keypoints[prop].y+y, interp:false}    
            controls[p].attr({cx:keypoints[prop].x, cy:keypoints[prop].y}).attr(control_attr["default"]);
            p=p+1;
        } 
        this.attr({cx: this.attr("cx")+x, cy: this.attr("cy")+y});
        this.attr(control_attr["default"]);
        redraw_connections();
    }
     
    center_control.drag(move,up);

    // When mouse goes over it; just change the attr
    center_control.mouseover(function() {
        this.attr(center_control_attr["mouseover"]);
    });

    // when mouse is pressed on central button;
    center_control.mousedown(function () {
        this.attr(center_control_attr["mouseover"]); 
    });

    center_control.mouseup(function(){
        center_control.update(0,0);                     //set all interp to false
        this.attr (center_control_attr["default"]);  
        
        var prop_array = [];
        for (var i=0;i<control_points.length;i++){ 
            prop_array[i] = control_points[i];
        }

        //look ahead till interp==false or end -- linearly intepolate
        var look_ahead = current_image+2;
        while ( look_ahead < nimages && 
                annotation.hasOwnProperty(look_ahead) && 
                annotation[look_ahead].hasOwnProperty("data")){
            var inc_look_ahead = true;
            for (var i=0;i<prop_array.length;i++){
                var prop = prop_array[i];
                if (annotation[look_ahead].data[prop].interp===false ){
                    inc_look_ahead = false;
                }
            }
            if (inc_look_ahead===true){    
                look_ahead++;
            }
        }    
        
        if (look_ahead < nimages && 
                annotation.hasOwnProperty(look_ahead) &&
                annotation[look_ahead].hasOwnProperty("data") ){
            //console.log("cont");        
        }else{
                look_ahead--;
        }
            //interpolate...
          //  console.log(look_ahead);
        if (annotation.hasOwnProperty(look_ahead) && annotation[look_ahead].hasOwnProperty("data")){
          //  console.log("forward interpolation");
            for (var i=0;i<prop_array.length;i++){
                var prop = prop_array[i];
                var x_inc = annotation[look_ahead].data[prop].x - annotation[current_image].data[prop].x ;
                var y_inc = annotation[look_ahead].data[prop].y - annotation[current_image].data[prop].y ;
            
                x_inc = x_inc/(look_ahead-current_image);
                y_inc = y_inc/(look_ahead-current_image);
                var x_init = annotation[current_image].data[prop].x;
                var y_init = annotation[current_image].data[prop].y;

                for (var p = current_image; p < look_ahead; p++){
                    annotation[p].data[prop].x = x_init + x_inc*(p-current_image);
                    annotation[p].data[prop].y = y_init + y_inc*(p-current_image);
                }
            }
        }


        var look_back = current_image-2;
        while (look_back > -1 &&
                annotation.hasOwnProperty(look_back) &&
                annotation[look_back].hasOwnProperty("data")){ 

            var dec_look_back = true;
            for (var i=0;i<prop_array.length;i++){
                var prop = prop_array[i];
                if (annotation[look_back].data[prop].interp===false){
                    dec_look_back = false;
                }
            }
            if (dec_look_back===true){
                look_back--;
            }
        }

        if (look_back > -1 && 
            annotation.hasOwnProperty(look_back) &&
            annotation[look_back].hasOwnProperty("data")) {

        }else{
            look_back++;
        }      

      //  console.log(look_back);
        if ( annotation.hasOwnProperty(look_back) && annotation[look_back].hasOwnProperty("data")){ 
                  //interpolate...
            //      console.log("backward interpolation")
            for (var i=0;i<prop_array.length;i++){
                var prop= prop_array[i];
                var x_inc = annotation[look_back].data[prop].x - annotation[current_image].data[prop].x ;
                var y_inc = annotation[look_back].data[prop].y - annotation[current_image].data[prop].y ;

                x_inc = x_inc/(look_back-current_image);
                y_inc = y_inc/(look_back-current_image);
                var x_init = annotation[current_image].data[prop].x;
                var y_init = annotation[current_image].data[prop].y;

                for (var p = current_image ; p > look_back; p--){
                    annotation[p].data[prop].x = x_init + x_inc*(p-current_image);
                    annotation[p].data[prop].y = y_init + y_inc*(p-current_image);
                }
            }   
        }
        
    });

    center_control.mouseout(function(){
        var check = true;
        for (var prop in keypoints){
            check = check & keypoints[prop].interp;
        }
        var attr = check ? center_control_attr["interp"]: center_control_attr["default"];    
        this.attr(attr);
    });    

    controls.drag(move, up);

    controls.mousedown(function () {
        this.attr(control_attr["mouseover"]); 
    });
    
    controls.mouseover(function(){
        this.attr(control_attr["mouseover"]);
    });

    controls.mouseup(function () {
        var prop = control_points[this.id-base_id];
        keypoints[prop].interp = false; 
        this.attr(control_attr["default"]);
        
        //look ahead till interp==false or end -- linearly intepolate
        var look_ahead = current_image+2;
        while ( look_ahead < nimages && 
                    annotation.hasOwnProperty(look_ahead) && 
                    annotation[look_ahead].hasOwnProperty("data") && 
                    annotation[look_ahead].data[prop].interp===true ){
            look_ahead++;
        }
        if (look_ahead < nimages && 
                annotation.hasOwnProperty(look_ahead) &&
                annotation[look_ahead].hasOwnProperty("data") ){
            //console.log("cont");        
        }else{
            look_ahead--;
        }
            //interpolate...
          //  console.log(look_ahead);
        if (annotation.hasOwnProperty(look_ahead) && annotation[look_ahead].hasOwnProperty("data")){
          //  console.log("forward interpolation");
            var x_inc = annotation[look_ahead].data[prop].x - annotation[current_image].data[prop].x ;
            var y_inc = annotation[look_ahead].data[prop].y - annotation[current_image].data[prop].y ;
        
            x_inc = x_inc/(look_ahead-current_image);
            y_inc = y_inc/(look_ahead-current_image);
            var x_init = annotation[current_image].data[prop].x;
            var y_init = annotation[current_image].data[prop].y;

            for (var p = current_image; p < look_ahead; p++){
                annotation[p].data[prop].x = x_init + x_inc*(p-current_image);
                annotation[p].data[prop].y = y_init + y_inc*(p-current_image);
            }
        }

        var look_back = current_image-2;
        while (look_back > -1 &&
                    annotation.hasOwnProperty(look_back) &&
                    annotation[look_back].hasOwnProperty("data") &&
                    annotation[look_back].data[prop].interp===true){
            look_back--;
        }

        if (look_back > -1 && 
            annotation.hasOwnProperty(look_back) &&
            annotation[look_back].hasOwnProperty("data")) {

        }else{
            look_back++;
        }      

      //  console.log(look_back);
        if ( annotation.hasOwnProperty(look_back) && annotation[look_back].hasOwnProperty("data")){ 
                  //interpolate...
            //      console.log("backward interpolation")
            var x_inc = annotation[look_back].data[prop].x - annotation[current_image].data[prop].x ;
            var y_inc = annotation[look_back].data[prop].y - annotation[current_image].data[prop].y ;

            x_inc = x_inc/(look_back-current_image);
            y_inc = y_inc/(look_back-current_image);
            var x_init = annotation[current_image].data[prop].x;
            var y_init = annotation[current_image].data[prop].y;

            for (var p = current_image ; p > look_back; p--){
                annotation[p].data[prop].x = x_init + x_inc*(p-current_image);
                annotation[p].data[prop].y = y_init + y_inc*(p-current_image);
            }
        }
    });
    
    controls.mouseout(function(){
        var prop = control_points[this.id-base_id];
        var attr = (keypoints[prop].interp)? control_attr["interp"]: control_attr["default"];
        this.attr(attr); 
    });
} // end draw_puppet

function move(dx, dy) {
    this.update(dx - (this.dx || 0), dy - (this.dy || 0));
    this.dx = dx;
    this.dy = dy;
}
        
function up() {
    this.dx = this.dy = 0;
}

// copied from http://stackoverflow.com/questions/3665115/create-a-file-in-memory-for-user-to-download-not-through-server
function download(filename, text) {
  var pom = document.createElement('a');
  pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  pom.setAttribute('download', filename);

  pom.style.display = 'none';
  document.body.appendChild(pom);

  pom.click();

  document.body.removeChild(pom);
}


function annotation_to_csv(a){
    var header = "filename";
    for (var i=0;i<control_points.length;i++){
        header=header+" ,"+control_points[i]+"_x ,"+control_points[i]+"_y"; 
    }

    return a.reduce(function(p,c){
            str = c.filename; 
            for (var i=0;i<control_points.length;i++){
                str = str + " ," + c.data[control_points[i]].x + ", " + c.data[control_points[i]].y;
            } 
            return p+ "\n"+str;
        },header);    
}

function annotation_to_json(a){
    /* var temp={};
    for (i=0;i<a.length;i++){
        temp[i]={};
        temp[i].src = a[i].img.src;
        if (a[i].data !== undefined){
            temp[i].data = {};
            for (var p=0;p<control_points.length;p++){
                temp[i].data[control_points[p]] = a[i].data[control_points[p]];
            }
        }
    } */
    return JSON.stringify(a);
}

//invokes download of annotation
function download_annotation(){
    value = $("input[name=download_fmt]:checked").val();
    if (value === "csv"){
        save_string = annotation_to_csv(annotation);
        download("data.csv", save_string);
    }else if (value === "json"){
        save_string = annotation_to_json(annotation);
        download("data.json", save_string);
    }else{
        alert("no download format selected");
    }
}

// returns the number of image annotations to be copied
// read value from a form-feed
function get_copy_num(){
    var ret = document.getElementById('copy_num').value;
    if (isNaN(ret)|| ret===""){
        return 1;
    }else{
        return Number(ret);
    }
    return 1;
}

// raise an error for the user and show it for t secs
function raise_error(err_str, t){  
    var err_el = r.text(r.width/2,20,err_str).attr({fill: "#FFFF00", "font-size": 20});
    err_el.animate({ opacity : 0 },t*1000,">",function () { });
}

// return a data structure like annotation.data, which has new coordinates as per optical flow 
// note that flow between x & x+1 is stored in x
function flow_prediction(predict_from,callback){
    var img         = new Image();
    var c           = document.createElement("canvas")
    var ctx         = c.getContext("2d");

    
    img.onload      = function(){
            var new_data    = [];
    
            c.width  = this.width;
            c.height = this.height;
    
            var w    = this.width ;  
            var h    = this.height;
        
            ctx.drawImage(this, 0, 0);
            
            var idata = ctx.getImageData(0, 0, this.width, this.height);
            var p     = idata.data;
            var l;
            var data  = annotation[predict_from].data
            for (var prop in data){
                l = (data[prop].y*w + data[prop].x)*4;
                //new_data[prop] = {x:data[prop].x+p[l+1]-128,y:data[prop].y+p[l+2]-128};
                // taking care of opencv's bgr format. r is x and g is y
                new_data[prop] = {x:data[prop].x+p[l+2]-128,y:data[prop].y+p[l+1]-128};

            }
            callback(new_data,predict_from+1);
        }
     //image.crossOrigin="anonymous";
    if ( img.complete || img.complete === undefined ) {
        img.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
        img.src = sprintf( flow_path, [predict_from]);
    }   
   
    img.src  = sprintf( flow_path, [predict_from]);  
}

// use optical flow to copy the annotations
function copy_with_flow(){
    var limit = current_image+get_copy_num();
    function set_flow_annotation (dat,index_to_set){
        annotation[index_to_set] = {};
        annotation[index_to_set].data = jQuery.extend(true,{},dat);
        annotation[index_to_set].filename = sprintf ( img_path, [index_to_set] );
        var annotate = annotation[index_to_set].data;
        for (var prop in  annotate){
            annotate[prop].interp = true;
        }
        if (index_to_set < nimages-1 && index_to_set < limit){
            flow_prediction(index_to_set,set_flow_annotation)
        }
        advance_frame(1);
    }


    if (current_image >= nimages-1){
        raise_error ("There are no more frames ahead",5);
    }else{
        if (annotation.hasOwnProperty(current_image) && annotation[current_image].hasOwnProperty("data")){
            var copy_num = get_copy_num();
            var annotate = annotation[current_image].data;
            /* shoould not make it false
            for (var prop in annotate){
                annotate[prop].interp = false;
            }
            */
            //for (var i = current_image+1; i<=current_image+copy_num && i<nimages; i++){
            
            //This is to circumvent the img.onload in flow_prediction function ; 
            // because we can't return from it
            //cant use a for loop here; again asynchronous call :'(
            i = current_image;
            flow_prediction(i,set_flow_annotation);
        }else{
            raise_error('No annotation to copy',5);
        }
    }
}

// copy previous annotation
function copy_annotation(){
    if (current_image >= nimages-1){
        raise_error("There are no more frames ahead",5);       
    }else{
        if (annotation.hasOwnProperty(current_image) &&annotation[current_image].hasOwnProperty("data")){
            var copy_num = get_copy_num();
            var annotate = annotation[current_image].data;
            /* should not make it false
            for (var prop in annotate){
                annotate[prop].interp = false;
            }
            */
            var limit = current_image+copy_num;
            for (var i = current_image+1; i<=limit && i<nimages; i++){
                annotation[i]      = {};
                annotation[i].data = jQuery.extend(true,{},annotation[current_image].data);
                var annotate       = annotation[i].data;
                for (var prop in  annotate){
                    annotate[prop].interp = true;
                }
                annotation[i].filename = sprintf ( img_path, [i] );
                advance_frame(1);
            }
            //advance_frame(copy_num); coz advancing by 1 looks cool
        }else{
            raise_error('No annotation to copy',5);
        }
    }
}
 
// generate a random puppet
function gen_rand_annotation(){
    annotation[current_image] = {};
    annotation[current_image].data = {};
    annotation[current_image].filename = sprintf ( img_path, [current_image] );
    var annotate = annotation[current_image].data;
    for (var prop in rand_coordinates){
        annotate[prop] ={x: rand_coordinates[prop].x, y: rand_coordinates[prop].y, interp: true}; 
    }
    update_image();
}

// Image display related functions
// updates the frame 
function update_image() {
    r.clear();
    $('#image').attr('src',sprintf( img_path, [current_image] )); 
    var new_text = sprintf('You are currently on frame %d / %d', current_image+1, nimages);
    $('#info-text').text( new_text ); // update the text at the top
    $('#copy_bttn').prop('disabled',true);
    $('#flow_bttn').prop('disabled',true);
    if (show_annotation && annotation.hasOwnProperty(current_image) && annotation[current_image].hasOwnProperty("data")){
            var annotate = annotation[current_image].data;
            draw_puppet(annotate);
            $('#copy_bttn').prop('disabled',false);
            $('#flow_bttn').prop('disabled',false);
    }    
}

// set frame no to frame_no
function set_frame( frame_no ) {
    current_image  = frame_no;
    update_image();
}

// moves ahead by no_of_frame --- can take negative no. and go back
function advance_frame(no_of_frame){
    var temp_current_image = current_image + no_of_frame;
    if (temp_current_image >= nimages){
        current_image = nimages-1;
    }else if (temp_current_image < 0){
            current_image = 0;
    }else{
        current_image = temp_current_image;
    }
    update_image();
    return ;
}

function play_frames(){
    $('#random_bttn').prop('disabled', true);
    $('#copy_bttn').prop('disabled',true);
    $('#flow_bttn').prop('disabled',true);
   
    $('#play_bttn').hide();
    $('#pause_bttn').show();
    
    play = window.setInterval(function() {
        // if image is not loaded it do not advances & reattempts to load
        if (is_image_loaded){
            advance_frame(1);
            is_image_loaded=false;
        }else{
            update_image();
        }

        if (current_image >= nimages-1){
            window.clearInterval(play);
            play = undefined;
            $('#random_bttn').prop('disabled', false);
            $('#copy_bttn').prop('disabled',false);
            $('#flow_bttn').prop('disabled',false);
        }
    },1000/FPS);
}

function pause_frames(){
    $('#random_bttn').prop('disabled', false);
    $('#copy_bttn').prop('disabled',false);
    $('#flow_bttn').prop('disabled',false);
    $('#play_bttn').show();
    $('#pause_bttn').hide();
    window.clearInterval(play);
    play = undefined;
}

function stop_frames(){
    window.clearInterval(play);
    play = undefined;
    $('#random_bttn').prop('disabled', false);
    $('#copy_bttn').prop('disabled',false);
    $('#flow_bttn').prop('disabled',false);
    $('#play_bttn').show();
    $('#pause_bttn').hide();
    set_frame(0);
}

function delete_annotation(){
    // its kind of a soft delete which deletes only when its a border frame else tries to undo the changes made by user. 
    // if intermediate frame 
    if (annotation.hasOwnProperty(current_image) && annotation[current_image].hasOwnProperty("data") 
        && annotation.hasOwnProperty(current_image-1) && annotation[current_image-1].hasOwnProperty("data")
        && annotation.hasOwnProperty(current_image+1) && annotation[current_image+1].hasOwnProperty("data")){
        
       // console.log("interpolation");  

        for (var i=0;i<control_points.length;i++){ 
            var prop =  control_points[i];
        

            //look ahead till interp==false or end -- linearly intepolate
            var look_ahead = current_image+1;
            while ( look_ahead < nimages && 
                    annotation.hasOwnProperty(look_ahead) && 
                    annotation[look_ahead].hasOwnProperty("data") &&
                    annotation[look_ahead].data[prop].interp===true){
                look_ahead++;
            }    
            
            if (look_ahead < nimages && 
                    annotation.hasOwnProperty(look_ahead) &&
                    annotation[look_ahead].hasOwnProperty("data") ){
                //console.log("cont");        
            }else{
                    look_ahead--;
            }
            
            //now we look back 
            var look_back = current_image-1;
            while (look_back > -1 &&
                    annotation.hasOwnProperty(look_back) &&
                    annotation[look_back].hasOwnProperty("data") &&
                    annotation[look_back].data[prop].interp===true){
                look_back--;
            }
            
            if (look_back > -1 && 
                annotation.hasOwnProperty(look_back) &&
                annotation[look_back].hasOwnProperty("data")) {

            }else{
                look_back++;
            }

            //interpolate between look_ahead and look_back 
            if (annotation.hasOwnProperty(look_ahead) && annotation[look_ahead].hasOwnProperty("data")
                && annotation.hasOwnProperty(look_back) && annotation[look_back].hasOwnProperty("data")){
                    
                    var x_inc = annotation[look_ahead].data[prop].x - annotation[look_back].data[prop].x ;
                    var y_inc = annotation[look_ahead].data[prop].y - annotation[look_back].data[prop].y ;
                
                    x_inc = x_inc/(look_ahead-look_back);
                    y_inc = y_inc/(look_ahead-look_back);
                    var x_init = annotation[look_back].data[prop].x;
                    var y_init = annotation[look_back].data[prop].y;

                    for (var p = look_back+1; p < look_ahead; p++){
                        annotation[p].data[prop].x = x_init + x_inc*(p-look_back);
                        annotation[p].data[prop].y = y_init + y_inc*(p-look_back);
                    }
                    annotation[current_image].data[prop].interp = true;
            }
               
        }
        update_image();  
    }else if (annotation.hasOwnProperty(current_image) && annotation[current_image].hasOwnProperty("data")){
        delete(annotation[current_image])
        update_image();
    }else{
        raise_error("No annotation on this frame to delete",5);
    }
}

$('#fwd_bttn').click(function () {
    advance_frame(1);
});

$('#play_bttn').click(function () {
    play_frames();
});

$('#pause_bttn').click(function () {
    pause_frames();
});

$('#stop_bttn').click(function () {
    stop_frames(); 
});

$('#back_bttn').click( function() {
    advance_frame(-1);
});

$('#random_bttn').click(function() {
    gen_rand_annotation();
});
        
$('#copy_bttn').click(function() {
    copy_annotation();
});   
    
$('#flow_bttn').click(function() {
    copy_with_flow();
}); 

$('#del_bttn').click(function() {
    delete_annotation();
}); 

$('#dnld_annotation').click(function() {
    download_annotation();
});   

$(document).keydown(function(e){
    switch (e.which){
        case 37: //left
                advance_frame(-1);
                break;
        case 39: //right
                advance_frame(1);
                break;
        case 32: //space
                if (e.ctrlKey){
                    advance_frame(-1);
                }else{
                    advance_frame(1);
                }
                break;
        case 67: //ctrl+c   
                if (e.ctrlKey){
                    copy_annotation();
                }
                break;
        case 70: //f
                if (e.ctrlKey){
                    copy_with_flow();
                }
                break;
        case 82: //r
                if (e.ctrlKey){
                $('#random_bttn').click();
                }
                break;
        case 83: //s
                if (e.ctrlKey){
                    download_annotation();
                }
                break;
        case 88: //x
                if (e.ctrlKey){
                    delete_annotation();
                }
                break;
        case 80: if (play===undefined){  
                    $('#play_bttn').click();
                }else {
                    $('#pause_bttn').click();
                }
                break;
        case 65:
                if (e.ctrlKey){
                    $('#stop_bttn').click();
                }
                break;
        default: console.log(e.which); return;
    }
    e.preventDefault();
});
 
set_frame(0);

        // this should give you access to the precomputed flow.
        /* commenting it out for now as we are not using optical flow now- Umang 
        var img = new image()
        var c = document.createelement("canvas")
        img.src = sprintf( flow_path, 1);
        img.onload = function() {
            c.width = img.width;
            c.height = img.height;
            var w = img.width, h = img.height;
            var ctx = c.getcontext("2d");
            ctx.drawimage(img, 0, 0);
            var idata = ctx.getimagedata(0, 0, img.width, img.height);
            var p     = idata.data;
            var lidx;
            var r, g, b, alpha;
            // loop through image pixels
            for (var y=0; y<img.height; y++) {
                for (var x=0; x<img.width; x++) {
                    l = ( y*w + x ) * 4; // convert to linear index
                    r = p[l];   // red should always be zero
                    g = p[l+1]; // green minus 128 is flow in x
                    b = p[l+2]  //  blue minus 128 is flow in y
                    alpha = p[l+3]; // alpha will always be 255
                }
            }
        }
        */
/*
for (i=0; i<nimages; i++) {
    annotation[i]           = [];
    annotation[i].img       = new Image();
    annotation[i].flow      = new Image();
    annotation[i].flow.src  = sprintf( flow_path, [i+1]);  // name of flow file
    annotation[i].img.src   = sprintf( img_path, [i+1] );  // name of the image file.
}
*/        
//txt_element = r.text(310, 20, "drag the points to change the curves").attr({fill: "#fff", "font-size": 16});
//txt_element.toFront();

/*
function chkbox(){
    var img_chk = document.getElementById("show_image_chkbox");
    img_chk.checked ? show_image = true : show_image = false;
    
    var annotation_chk = document.getElementById("show_annotation_chkbox");
    annotation_chk.checked ? show_annotation = true : show_annotation = false;
   
    update_image();
}
*/
