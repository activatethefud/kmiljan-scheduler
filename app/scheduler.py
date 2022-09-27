import json
from pprint import pprint
from random import shuffle
from copy import copy

import numpy as np


class Scheduler:
    def __init__(self, courses):
        self.bitmap = np.zeros(shape=(5, 13))
        self.placed = set([])
        self.courses = courses
        self.schedules = []

    def find(self):

        def classroom_group(course):
            if(course.get("classroom") == None): return 0
            if(course["classroom"][0] == 'J'): return 1
            if(course["classroom"][0] == 'N'): return 2
            return 0

        self._find(0)
        self.schedules.sort(key = lambda list : sum([
            x["start"] for x in list
        ])/len(list))

        fixed_bad_schedules = []

        for schedule in self.schedules:
            passes = True
            n = len(schedule)

            for idx,course in enumerate(schedule):
                i = idx
                if(idx < n-1):
                    if(schedule[i]["day"] == schedule[i+1]["day"]):
                        if(classroom_group(schedule[i]) != classroom_group(schedule[i+1])):
                            if(schedule[i+1]["start"] - schedule[i]["end"] < 1):
                                passes = False
                                break
            
            if(passes):
                fixed_bad_schedules.append(schedule)
        

        self.schedules = copy(fixed_bad_schedules)

        #shuffle(self.schedules)
        return self.schedules

    def _find(self, i):
        if i == len(self.courses):
            placed_list = [json.loads(x) for x in self.placed]
            placed_list.sort(key=lambda x: (x["day"], x["end"]), reverse=True)
            self.schedules.append(placed_list)
            return True
        for term in self.courses[i][2]:
            if not self.conflict(term):
                self.place(term)
                self._find(i + 1)
                self.remove(term)
        return len(self.schedules) > 0

    def conflict(self, term):
        for i in range(term["start"] - 8, term["end"] - 8):
            if self.bitmap[term["day"]][i] == 1:
                return True
        return False

    def place(self, term):
        for i in range(term["start"] - 8, term["end"] - 8):
            self.bitmap[term["day"]][i] = 1
        self.placed.add(json.dumps(term))

    def remove(self, term):
        for i in range(term["start"] - 8, term["end"] - 8):
            self.bitmap[term["day"]][i] = 0
        self.placed.remove(json.dumps(term))

    def done(self):
        return len(self.placed) == len(self.courses)
