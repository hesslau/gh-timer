var GhTimer = function(starttime,agenda) {

    function Time(hours, minutes, seconds) {

        var time = {};

        if (minutes != undefined && seconds != undefined) {
            time.stamp = (hours * 60 + minutes) * 60 + seconds;
        } else if (hours != undefined) {
            time.stamp = hours;
        } else {
            time = Time((new Date()).getHours(), (new Date()).getMinutes(), (new Date()).getSeconds());
        }

        time.add = function (otherTime) {
            return Time(time.stamp + otherTime.stamp);
        };

        time.toString = function () {
            var seconds = time.stamp % 60;
            var minutes = (time.stamp - seconds) / 60 % 60;
            var hours = ((time.stamp - seconds) / 60 - minutes) / 60;

            if(hours < 10) hours = '0' + hours;
            if(minutes < 10) minutes = '0' + minutes;
            if(seconds < 10) seconds = '0' + seconds;

            return [hours, minutes, seconds].join(':');
        };


        time.timeUntil = function(otherTime) {
            return Time(0,0,time.secondsUntil(otherTime));
        }

        time.secondsUntil = function (otherTime) {
            return otherTime.stamp - time.stamp;
        };

        return time;
    }

    /* A TimeBlock has a title and a duration */
    function TimeBlock(title, durationInMinutes) {
        var block = {};
        block.title = title;
        block.durationInMinutes = durationInMinutes;

        return block;
    }

    /* A TimeInterval is a TimeBlock with start */
    function TimeInterval(starttime, timeblock) {
        var interval = {};

        interval.startTime = starttime;
        interval.endTime = starttime.add(Time(0, timeblock.durationInMinutes, 0));
        interval.title = timeblock.title;
        interval.durationInMinutes = timeblock.durationInMinutes;

        return interval;
    }

    /* An Agenda is a list of TimeBlocks */
    function Agenda() {
        var agenda = {};

        agenda.blocks = Array.prototype.slice.call(arguments);

        agenda.add = function(timeblock) {
            return Agenda.apply(this, agenda.blocks.concat([timeblock]));
        };

        return agenda;
    }

    /* A Schedule is an Agenda with a starttime */
    function Schedule(starttime, agenda) {
        var schedule = {};

        schedule.startTime = starttime;
        schedule.agenda = agenda;

        schedule.invervals = (function () {
            var invervals = [];
            var startTime = schedule.startTime.add(Time(0));
            for (var i in schedule.agenda.blocks) {
                var interval = TimeInterval(startTime, schedule.agenda.blocks[i]);
                startTime = interval.endTime;
                invervals.push(interval);
            }
            return invervals;
        })();

        schedule.currentBlock = function () {
            for (var i in schedule.invervals) {
                if (Time().secondsUntil(schedule.invervals[i].endTime) > 0) return schedule.invervals[i];
            }
        };

        schedule.endOfBlock = function (i) {
            return schedule.invervals[i].endTime;
        };

        return schedule;
    }

    function add(title, durationInMinutes) {
        return GhTimer(starttime, agenda.add(TimeBlock(title, durationInMinutes)));
    }

    function startsAt(hours, minutes, seconds) {
        return GhTimer(Time(hours,minutes, seconds), agenda);
    }

    function display(selectors) {
        timer.interval = setInterval(function() {

            if(timer.currentBlock() == undefined) {
                if(selectors.title)
                    document.querySelector(selectors.title).innerHTML       = "Finished";

                if(selectors.helper)
                    document.querySelector(selectors.helper).remove();

                clearInterval(timer.interval);
            }
            else {
                if(selectors.countdown)
                    document.querySelector(selectors.countdown).innerHTML   = Time().timeUntil(timer.currentBlock().endTime).toString();

                if(selectors.title)
                    document.querySelector(selectors.title).innerHTML       = timer.currentBlock().title;

                if(selectors.endtime)
                    document.querySelector(selectors.endtime).innerHTML     = timer.currentBlock().endTime.toString();

                // todo
                //if(selectors.nextTitle)
                //    document.querySelector(selectors.nextTitle).innerHTML   = nextBlock().title;
            }
        },1000);
    }

    function stopDisplay() {
        clearInterval(timer.interval);
    }

    if(agenda == undefined && starttime == undefined) {
        agenda = Agenda();
        starttime = Time();
    }
    var timer = Schedule(starttime,agenda);
    console.log(starttime, agenda);
    return {
        add: add,
        startsAt: startsAt,
        display: display,
        stop: stopDisplay,
        agenda: agenda,
        starttime: starttime
    };

};


