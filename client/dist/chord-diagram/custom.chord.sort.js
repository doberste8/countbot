"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var d3_array_1 = require("d3-array");
var cos = Math.cos;
var sin = Math.sin;
var pi = Math.PI;
var halfPi = pi / 2;
var tau = pi * 2;
var max = Math.max;
function compareValue(compare) {
    return function (a, b) {
        return compare(a.source.value + a.target.value, b.source.value + b.target.value);
    };
}
function default_1() {
    var padAngle = 0, sortGroups = null, sortSubgroups = null, sortChords = null;
    function chord(matrix) {
        var n = matrix.length, groupSums = [], groupOutSums = [], groupIndex = d3_array_1.range(n), subgroupIndex = [], chords = [], groups = chords.groups = new Array(n), subgroups = new Array(n * n), k, total, x, x0, dx, i, j;
        var numSeq;
        // Compute the sum.
        k = 0, i = -1;
        while (++i < n) {
            x = 0, j = -1, numSeq = [];
            while (++j < n) {
                x += matrix[i][j];
            }
            groupSums.push(x);
            //////////////////////////////////////
            ////////////// New part //////////////
            //////////////////////////////////////
            for (var m = 0; m < n; m++) {
                numSeq[m] = (n + (i - 1) - m) % n;
            }
            subgroupIndex.push(numSeq);
            //////////////////////////////////////
            //////////  End new part /////////////
            //////////////////////////////////////
            k += x;
        }
        // Compute the outgoing sums.
        i = -1;
        while (++i < n) {
            x = 0, j = -1, numSeq = [];
            while (++j < n) {
                x += matrix[j][i];
            }
            groupOutSums.push(x);
        }
        // Sort groups…
        if (sortGroups)
            groupIndex.sort(function (a, b) {
                return sortGroups(groupSums[a], groupSums[b]);
            });
        // Sort subgroups…
        if (sortSubgroups)
            subgroupIndex.forEach(function (d, i) {
                d.sort(function (a, b) {
                    return sortSubgroups(matrix[i][a], matrix[i][b]);
                });
            });
        // Convert the sum to scaling factor for [0, 2pi].
        // TODO Allow start and end angle to be specified?
        // TODO Allow padding to be specified as percentage?
        total = k;
        k = max(0, tau - padAngle * n) / k;
        dx = k ? padAngle : tau / n;
        // Compute the start and end angle for each group and subgroup.
        // Note: Opera has a bug reordering object literal properties!
        x = 0, i = -1;
        while (++i < n) {
            x0 = x, j = -1;
            while (++j < n) {
                var di = groupIndex[i], dj = subgroupIndex[di][j], v = matrix[di][dj], a0 = x, a1 = x += v * k;
                subgroups[dj * n + di] = {
                    index: di,
                    sortindex: i,
                    subindex: dj,
                    startAngle: a0,
                    endAngle: a1,
                    value: v
                };
            }
            groups[di] = {
                index: di,
                sortindex: i,
                startAngle: x0,
                endAngle: x,
                value: groupSums[di],
                outValue: groupOutSums[di],
                total: total
            };
            x += dx;
        }
        // Generate chords for each (non-empty) subgroup-subgroup link.
        i = -1;
        while (++i < n) {
            j = i - 1;
            while (++j < n) {
                var source = subgroups[j * n + i], target = subgroups[i * n + j];
                if (source.value || target.value) {
                    chords.push(source.value < target.value
                        ? { source: target, target: source }
                        : { source: source, target: target });
                }
            }
        }
        return sortChords ? chords.sort(sortChords) : chords;
    }
    chord.padAngle = function (_) {
        return arguments.length ? (padAngle = max(0, _), chord) : padAngle;
    };
    chord.sortGroups = function (_) {
        return arguments.length ? (sortGroups = _, chord) : sortGroups;
    };
    chord.sortSubgroups = function (_) {
        return arguments.length ? (sortSubgroups = _, chord) : sortSubgroups;
    };
    chord.sortChords = function (_) {
        return arguments.length ? (_ == null ? sortChords = null : (sortChords = compareValue(_))._ = _, chord) : sortChords && sortChords._;
    };
    return chord;
}
exports.default = default_1;
