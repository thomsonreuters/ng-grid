ngGridDirectives.directive('ngInput', ['$timeout', function ($timeout) {
    return {
        require: 'ngModel',
        link: function (scope, elm, attrs, ngModel) {
            // Store the initial cell value so we can reset to it if need be
            var oldCellValue;
            var dereg = scope.$watch('ngModel', function() {
                oldCellValue = ngModel.$modelValue;
                dereg(); // only run this watch once, we don't want to overwrite our stored value when the input changes
            });

            function keydown (evt) {
                switch (evt.keyCode) {
                    case 9:
                        var cellElm = elm.parents("*[ng-cell-has-focus]");

                        elm.blur();

                        cellElm.focus();

                        evt.which = evt.keyCode = 39;

                        ngMoveSelectionHandler(scope, null, evt, scope.domAccessProvider.grid, $timeout);

                        return false;
                    case 37: // Left arrow
                    case 38: // Up arrow
                    case 39: // Right arrow
                    case 40: // Down arrow
                        evt.stopPropagation();
                        break;
                    case 27: // Esc (reset to old value)
                        if (!scope.$$phase) {
                            scope.$apply(function() {
                                ngModel.$setViewValue(oldCellValue);
                                elm.blur();
                            });
                        }
                        break;
                    case 13: // Enter (Leave Field)
                        if(scope.totalFilteredItemsLength() - 1 > scope.row.rowIndex && scope.row.rowIndex > 0  || scope.col.enableCellEdit) {
                            var cellElm = elm.parents("*[ng-cell-has-focus]");

                            elm.blur();

                            evt.which = evt.keyCode = 40;

                            var ret = ngMoveSelectionHandler(scope, null, evt, scope.domAccessProvider.grid, $timeout);

                            if (!ret) {
                                cellElm.focus();
                            }

                            return ret;
                        }
                        break;
                }

                return true;
            }
            
            elm.bind('keydown', keydown);

            function click (evt) {
                evt.stopPropagation();
            }

            elm.bind('click', click); 

            function mousedown (evt) {
                evt.stopPropagation();
            }

            elm.bind('mousedown', mousedown);

            function blur() {
                scope.$emit('ngGridEventEndCellEdit');
            }

            elm.bind('blur', blur);

            elm.on('$destroy', function() {
                elm.off('keydown', keydown);
                elm.off('click', click);
                elm.off('mousedown', mousedown);
                elm.off('blur', blur);
            });

            scope.$on('$destroy', scope.$on('ngGridEventStartCellEdit', function () {
                elm.focus();
                elm.select();
            }));
        }
    };
}]);
