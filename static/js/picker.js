var schedules;
var cur;

$(document).ready(function(){

    $('body').css('display', 'none');
    $('body').fadeIn(350);
    table_parent = $("#tableparent")
    empty_table = $('#table').clone()
    const smer = $('#smer').text();

    $("#courseform").submit(function(){

        let picked = {}
        let checked = $(':checkbox:checked')
        checked.each(function(){
            let name = $(this).attr("id")
            let selected = $("[course='"+name+"']:selected")
            prefs = {}
            selected.each(function(){
                prefs[$(this).attr("ctype")] = $(this).attr("value")
            })
            picked[$(this).attr('id')] = prefs
        })
        console.log(picked)

        fetch(`/api/scheduler/${smer}`, {
            method: 'POST',
            body: JSON.stringify(picked),
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(res => res.json())
        .then(data => schedules = data['schedules'])
        .then(() => console.log(schedules))
        .then(() => {

            if(!schedules){
                showError("raspored ne postoji")
                return false
            } else {
                window.scrollTo({
                    top: 0,
                    left: 0,
                    behavior: 'smooth'
                });
                showSchedule()
                fillSchedule(0)
            }

        })
        .catch(error => alert(error))
        
        return false
    });

    $("#nazad").click(function(){
        location.reload()
    })

    $("#home").click(function(){
        window.location = '/';
    })

    $("#sledeci").click(function(){
        cleanTable()
        fillSchedule((cur+1)%schedules.length)
    })

    function unshowSchedule(){
        $('#schedule').fadeOut(200)
        $('#courseform').fadeIn(200)
        $('#courseform').attr('hidden')
        $('#schedule').removeAttr('hidden')
    }

    function showSchedule(){
        $('#courseform').fadeOut(200, ()=>{
            $('#schedule').fadeIn(200)
            $('#courseform').attr('hidden')
            $('#schedule').removeAttr('hidden')
        })
    }

    function fillSchedule(i){
        cur = i;
        for(c in schedules[i]){
            placeInTable(schedules[i][c])
        }
    }

    function cleanTable(course){
        table_parent.find(":first-child").remove()
        table_parent.prepend(empty_table)
        empty_table = $('#table').clone()
    }

    function hashCode(str){
        var hash = 0;
        for (var i = 0; i < str.length; i++) {
           hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        return hash;
    } 
    
    function intToRGB(i){
        i = hashCode(i)
        var c = (i & 0x00FFFFFF)
            .toString(16)
            .toUpperCase();
    
        return "00000".substring(0, 6 - c.length) + c;
    }
    

    function placeInTable(course){
/*         td = $(`#td-${course.day}-${course.start-7}`)
        console.log(`#td-${course.day}-${course.start-7}`)
        td.text(course.description + " " + course.course_type)
  */       
        table = $('tbody')
        rows = table.children()
        day = rows[course.day]
        td = (day.children)[course.start-7]
        td.innerHTML = course.description
        if(course.course_type != 'lecture'){
            td.innerHTML += ` (${course.course_type[0] == 'e' ? 'vezbe' : 'praktikum'})`
        }
        td.innerHTML += `<br/>${course.teacher}`
        td.setAttribute('colspan', course.duration)
        td.setAttribute('hashcode', hashCode(td.innerHTML))
        td.style.background = `#${intToRGB(course.description)}`
        /* url('/static/img/bg.png') left top"; */
        /*td.style.color = '#ffffff' */

        for(let i = 1; i < course.duration; i++){
            excess = (day.children)[course.start-6]
            excess.remove()
        }
    }

    function showError(msg){
        alert(msg)
    }

    function generateCode(cbs){
        let code = [0, 0, 0, 0];
        for(let i = 0; i < 4; i++){
            code[i] = cbs[i].checked ? 1 : 0 
        }
        return code.join("");
    }

    function showSchedules(schedules){
        console.log(schedules)
    }

});