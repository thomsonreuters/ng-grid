//set event binding on the grid so we can select using the up/down keys
var ngMoveSelectionHandler = function($scope, elm, evt, grid, $timeout) {
    if ($scope.selectionProvider.selectedItems === undefined) {
        return true;
    }

    var charCode = evt.which || evt.keyCode,
        newColumnIndex,
        lastInRow = false,
        firstInRow = false,
        rowIndex = $scope.selectionProvider.lastClickedRow === undefined ? 1 : $scope.selectionProvider.lastClickedRow.rowIndex,
        visibleCols = $scope.columns.filter(function(c) { return c.visible; }),
        pinnedCols = $scope.columns.filter(function(c) { return c.pinned; });

    if ($scope.col) {
        newColumnIndex = visibleCols.indexOf($scope.col);
    }

    if (charCode !== 37 && charCode !== 38 && charCode !== 39 && charCode !== 40 && charCode !== 9 && charCode !== 13) {
        return true;
    }
    
    if ($scope.enableCellSelection) {
        if (charCode === 9) { 
            evt.preventDefault();
        }

        var focusedOnFirstColumn = $scope.showSelectionCheckbox ? $scope.col.index === 1 : $scope.col.index === 0;
        var focusedOnFirstVisibleColumns = $scope.$index === 1 || $scope.$index === 0;
        var focusedOnLastVisibleColumns = $scope.$index === ($scope.renderedColumns.length - 1) || $scope.$index === ($scope.renderedColumns.length - 2);
        var focusedOnLastColumn = visibleCols.indexOf($scope.col) === (visibleCols.length - 1);
        var focusedOnLastPinnedColumn = pinnedCols.indexOf($scope.col) === (pinnedCols.length - 1);
        
        if (charCode === 37 || charCode === 9 && evt.shiftKey) {
            var scrollTo = 0;

            if (!focusedOnFirstColumn) {
                newColumnIndex -= 1;
            }

            if (focusedOnFirstVisibleColumns) {
                if (focusedOnFirstColumn && charCode === 9 && evt.shiftKey){
                    scrollTo = grid.$canvas.width();
                    newColumnIndex = visibleCols.length - 1;
                    firstInRow = true;
                }
                else {
                    scrollTo = grid.$viewport.scrollLeft() - $scope.col.width;
                }
            }
            else if (pinnedCols.length > 0) {
                scrollTo = grid.$viewport.scrollLeft() - visibleCols[newColumnIndex].width;
            }

            grid.$viewport.scrollLeft(scrollTo);
        
        }
        else if (charCode === 39 || charCode ===  9 && !evt.shiftKey) {
            if (focusedOnLastVisibleColumns) {
                if (focusedOnLastColumn && charCode ===  9 && !evt.shiftKey) {
                    grid.$viewport.scrollLeft(0);
                    newColumnIndex = $scope.showSelectionCheckbox ? 1 : 0;  
                    lastInRow = true;
                }
                else {
                    grid.$viewport.scrollLeft(grid.$viewport.scrollLeft() + $scope.col.width);
                }
            }
            else if (focusedOnLastPinnedColumn) {
                grid.$viewport.scrollLeft(0);
            }

            if (!focusedOnLastColumn) {
                newColumnIndex += 1;
            }
        }
    }
    else if (!grid.config.noTabInterference && charCode === 9 || charCode === 37 || charCode === 39) {
        var tabbableElements = $(evt.target).parents(".ngRow").find(":tabbable");

        if (tabbableElements.length) {
            firstInRow = evt.target == tabbableElements[0];
            lastInRow = evt.target == tabbableElements[tabbableElements.length - 1];
        }
    }

    var items;
    if ($scope.configGroups.length > 0) {
        items = grid.rowFactory.parsedData.filter(function (row) {
            return !row.isAggRow;
        });
    }
    else {
        items = grid.filteredRows;
    }
    
    var offset = 0;
    var clickedRow;
    if (rowIndex !== 0 && (charCode === 38 || !grid.config.noTabInterference && charCode === 9 && evt.shiftKey && firstInRow || charCode === 37 && firstInRow)) {
        offset = -1;
    }
    else if (rowIndex !== items.length - 1 && (charCode === 40 || !grid.config.noTabInterference && charCode === 9 && !evt.shiftKey && lastInRow || charCode === 39 && lastInRow)) {
        offset = 1;
    }
    else if (charCode === 13 || !grid.config.noTabInterference && charCode === 9 || charCode === 37 || charCode === 39) {
        clickedRow = $scope.selectionProvider.clickedRow;

        if (evt.target == evt.currentTarget) { // .ngViewport
            clickedRow = $scope.selectionProvider.lastClickedRow = items[0];
        }
    }

    if (offset || clickedRow) {
        var r = clickedRow || items[rowIndex + offset];
        if (r.beforeSelectionChange(r, evt)) {
            r.continueSelection(evt);
            $scope.$emit('ngGridEventDigestGridParent');

            var scrolled = false;

            if ($scope.selectionProvider.lastClickedRow.renderedRowIndex >= $scope.renderedRows.length - EXCESS_ROWS - 2) {
                grid.$viewport.scrollTop(grid.$viewport.scrollTop() + $scope.rowHeight);
                scrolled = true;
            }
            else if ($scope.selectionProvider.lastClickedRow.renderedRowIndex <= EXCESS_ROWS + 2) {
                grid.$viewport.scrollTop(grid.$viewport.scrollTop() - $scope.rowHeight);
                scrolled = true;
            }

            var moveFocus = function () {
                if (charCode === 38 || charCode === 40) {
                    if ($scope.selectionProvider.lastClickedRow.elm || $scope.selectionProvider.lastClickedRow.renderedRowIndex != undefined) {
                        var lastClickedRowElement = $scope.selectionProvider.lastClickedRow.elm || $scope.renderedRows[$scope.selectionProvider.lastClickedRow.renderedRowIndex].elm;
                        var tabbableRowElements = lastClickedRowElement.find(":tabbable");

                        if ($scope.selectionProvider.lastFocusedElementIndex == undefined) {
                            $scope.selectionProvider.lastFocusedElementIndex = 0;
                        }

                        if (tabbableRowElements.length) {
                            $scope.selectionProvider.lastFocusedElement = $(tabbableRowElements[$scope.selectionProvider.lastFocusedElementIndex > tabbableRowElements.length - 1 ? tabbableRowElements.length - 1 : $scope.selectionProvider.lastFocusedElementIndex]);
                        }
                        else {
                            grid.$viewport.find(".ngRow").attr("tabindex", "0");
                            $scope.selectionProvider.lastFocusedElement = lastClickedRowElement;
                        }

                        $scope.selectionProvider.lastFocusedElement.focus();
                    }
                }
            };

            if (scrolled) {
                $timeout(moveFocus);
            }
            else {
                moveFocus();
            }
        }
    }

    if (!grid.config.noTabInterference && charCode === 9 || charCode === 37 || charCode === 39) {
        var focused = $(":focus");
        var lastClickedRowElement = $scope.selectionProvider.lastClickedRow.elm || $scope.renderedRows[$scope.selectionProvider.lastClickedRow.renderedRowIndex].elm;
        var tabbableRowElements = lastClickedRowElement.find(":tabbable");

        if (charCode === 37 || charCode === 9 && evt.shiftKey) {
            if (firstInRow && offset) {
                $scope.selectionProvider.lastFocusedElementIndex = tabbableRowElements.length - 1;
                $scope.selectionProvider.lastFocusedElement = tabbableRowElements.last();
                charCode !== 9 && $scope.selectionProvider.lastFocusedElement.focus();
            }
            else {
                $scope.selectionProvider.lastFocusedElementIndex = tabbableRowElements.index(focused) - 1;
                $scope.selectionProvider.lastFocusedElement = $(tabbableRowElements[$scope.selectionProvider.lastFocusedElementIndex]);
                charCode !== 9 && $scope.selectionProvider.lastFocusedElement.focus();
            }
        }
        else if (charCode === 39 || charCode === 9 && !evt.shiftKey) {
            if (lastInRow && offset) {
                $scope.selectionProvider.lastFocusedElementIndex = 0;
                $scope.selectionProvider.lastFocusedElement = tabbableRowElements.first();
                charCode !== 9 && $scope.selectionProvider.lastFocusedElement.focus();
            }
            else {
                $scope.selectionProvider.lastFocusedElementIndex = tabbableRowElements.index(focused) + 1;
                $scope.selectionProvider.lastFocusedElement = $(tabbableRowElements[$scope.selectionProvider.lastFocusedElementIndex]);
                charCode !== 9 && $scope.selectionProvider.lastFocusedElement.focus();
            }
        }
    }
    
    if ($scope.enableCellSelection) {
        setTimeout(function(){
            $scope.domAccessProvider.focusCellElement($scope, $scope.renderedColumns.indexOf(visibleCols[newColumnIndex]));
        }, 3);

        return false;
    }

    return grid.config.noTabInterference && charCode === 9;
};
