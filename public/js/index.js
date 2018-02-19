$(document).ready(function () {
    'use strict';  
    // nice scrolling

    $("html").niceScroll({
        cursorcolor:"silver",
        cursorwidth:"11px",
        cursorborder:"none",
    });
    
    // animation button 


    $(".btn, button").hover(function () {
        // over
        $(this).addClass("animated infinite  pulse");
    }, function () {
        // out
        $(this).removeClass("animated infinite  pulse");
        
    }
    );

    // nice text animation
    $(".tlt").textillate({loop:true , in:{effect:"fadeIn" } , out:{effect:"flash"}});

    function FFIXX () {
        // over
        $("body").find(".rating").each(function(){
            
        var r =  $(this).data("rating");
        if (r == 0) {
            $(this).html("<i class='fa fa-fw fa-star-o'></i>");
        } else if(r == 1) {
            $(this).html("<i class='fa fa-fw fa-star'></i>");               
        }else if(r == 2) {
            $(this).html("<i class='fa fa-fw fa-star'></i><i class='fa fa-fw fa-star'></i>");                
        }else if(r == 3) {
            $(this).html("<i class='fa fa-fw fa-star'></i><i class='fa fa-fw fa-star'></i><i class='fa fa-fw fa-star'></i>");
            
        }else if(r == 4) {
            $(this).html("<i class='fa fa-fw fa-star'></i><i class='fa fa-fw fa-star'></i><i class='fa fa-fw fa-star'></i><i class='fa fa-fw fa-star'></i>");
        }else if(r == 5) {
            $(this).html("<i class='fa fa-fw fa-star'></i><i class='fa fa-fw fa-star'></i><i class='fa fa-fw fa-star'></i><i class='fa fa-fw fa-star'></i><i class='fa fa-fw fa-star'></i>"); 
        }

    });
        
    $("body").find(".gradz").each(function () { 
        var arr = $(this).data("gradz").split(" ");
        var str = arr.splice(0,4).join("-");
        str  = str.slice(4,str.length);
        $(this).html(str);
    });
    }
    FFIXX();

    // about page function to dropdown and up he question and answer 


    $(".question").each(function () { 
        
        $(this).find(".Mark").addClass("fa fa-arrow-circle-right pull-right Mark");

        $(this).siblings(".answer").fadeOut();
        $(this).click(function () { 
            $(this).find(".Mark").toggleClass("fa fa-arrow-circle-right pull-right Mark ").toggleClass("fa fa-arrow-circle-down pull-right Mark") ;
            $(this).siblings(".answer").fadeToggle(600).parents().siblings().find(".answer").fadeOut();
         });

     });

     // function to edit user comment first show and hide button 

        $(".viewform").fadeOut();
        $(".editComment").hover(function () {
             // over
         $(this).find(".viewform").fadeIn();    
         }, function () {
             // out
             $(this).find(".viewform").fadeOut();
         }
        );

    $(".userComment").each(function () { 
        if ($(this).data("comment") === $(".userNow").data("now")) {
                
            $(this).parents(".lead").append('<button type="submit" style="margin-bottom:10px;" class="viewform  btn-sm btn btn-secondary pull-right">Edit <i class="fa fa-edit"></i> </button>');

        }
        }); 
        
        
        // function for edit comment by clone value of name doctor from outside each to inside it 
        //to send it with route 

        $(".nameDoc").val($(".nameDoctor").val());

  // End Of jquery       
});



//  function helper to pass forbidden error invalid csrf token
function ResubmitForm(){
    window.location = "/signup";
}
function ResubmitFormADD(){
    window.location = "/addDoctor";
}
function ResubmitFormC() {
    window.location = "/contact";
  }


