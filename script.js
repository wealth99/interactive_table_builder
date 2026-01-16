let isUpdate = false;
let isDelete = false;
let isRender = false;
let currentTarget;
let classOption = [];
let classOption2 = [];
let selectedTargets = [];  // 추가: 다중 선택 추적
let firstSelectedTarget = null;  // 추가: 첫 번째 선택된 타겟

document.addEventListener('DOMContentLoaded', () => {
    const options = document.querySelectorAll('.option');
    const options2 = document.querySelectorAll('.option2');
    const init = document.querySelector('.init');
    const action = document.querySelector('.action');
    const partChange = document.querySelector('.part-change');
    const reAction = document.querySelector('.re-action');
    const copy = document.querySelector('.copy');
    const add = document.querySelector('.add');
    const result = document.querySelector('#result');
    const targetUpdate = document.querySelector('.target-detail-popup .action'); 
    const targetDelete = document.querySelector('.target-detail-popup .init');
    const closePopup = document.querySelector('.target-detail-popup .close');
    const textarea = document.querySelector('.target-detail-popup textarea');
    const changeUpdate = document.querySelector('.part-change-popup .action'); 
    const closeChange = document.querySelector('.part-change-popup .close'); 
    
    init.addEventListener('click', reset);
    action.addEventListener('click', render);
    reAction.addEventListener('click', reRender);
    copy.addEventListener('click', setClipboard);
    add.addEventListener('click', addOption);

    result.addEventListener('click', openDetailPopup);
    targetDelete.addEventListener('click', removeTarget);
    targetUpdate.addEventListener('click', updateTarget);
    closePopup.addEventListener('click', closeDetailPopup);

    partChange.addEventListener('click', openPartChagePopup);
    changeUpdate.addEventListener('click', updateChange);
    closeChange.addEventListener('click', closePartChangePopup)

    options.forEach(option => option.addEventListener('change', setClassOption));
    options2.forEach(option => option.addEventListener('change', setClassOption2));

    document.addEventListener('keydown', handleDocumentKeydown);
    document.addEventListener('click', handleDocumentClick);
});

// 추가: 선택된 셀들 병합하기
const mergeSelectedTargets = () => {
    if(selectedTargets.length < 2) {
        alert('2개 이상의 셀을 선택해주세요...😒');
        return;
    }

    const mergedText = selectedTargets.map(cell => cell.textContent).join(' ');
    firstSelectedTarget.textContent = mergedText;

    // 나머지 선택된 셀들 삭제
    for(let i = 1; i < selectedTargets.length; i++) {
        const cell = selectedTargets[i];
        const parentTr = cell.closest('tr');

        cell.nextSibling?.nodeName === '#text' && cell.nextSibling.remove();
        cell.remove();

        if(parentTr && parentTr.children.length === 0) {
            parentTr.remove();
        }
    }

    // 선택 상태 초기화
    clearMultiSelection();
    isUpdate = true;
    isDelete = true;
}

// 추가: 다중 선택 상태 초기화
const clearMultiSelection = () => {
    selectedTargets.forEach(cell => {
        cell.classList.remove('multi-selected');
    });
    selectedTargets = [];
    firstSelectedTarget = null;

    const mergeBtn = document.querySelector('.merge-selected');
    if(mergeBtn) mergeBtn.remove();
}

// 추가: 다중 선택 버튼 생성
const createMergeButton = (x, y) => {
    const existingBtn = document.querySelector('.merge-selected');
    if(existingBtn) existingBtn.remove();

    const mergeBtn = document.createElement('button');
    mergeBtn.type = 'button';
    mergeBtn.className = 'merge-selected';
    mergeBtn.textContent = '병합';
    mergeBtn.style.position = 'fixed';
    mergeBtn.style.left = (x + 10) + 'px';
    mergeBtn.style.top = (y + 10) + 'px';
    mergeBtn.style.zIndex = '10000';
    mergeBtn.addEventListener('click', mergeSelectedTargets);

    document.body.appendChild(mergeBtn);
}

// document 클릭 이벤트 수정
const handleDocumentClick = e => {
    const isPopupOpen = document.querySelector('.target-detail-popup').classList.contains('show');

    if(!isPopupOpen) return;

    const target = e.target;
    const isPopup = target.closest('.target-detail-popup.show');

    if(!isPopup) closeDetailPopup();
}

// document 키보드 이벤트 수정
const handleDocumentKeydown = e => {
    const isPopupOpen = document.querySelector('.target-detail-popup').classList.contains('show');
    const key = e.key.toLowerCase();

    switch (key) {
        case 'escape':
            if(selectedTargets.length > 0) {
                clearMultiSelection();
            } else if(isPopupOpen) {
                closeDetailPopup();
            }
            break;
        case 'delete':
            if(isPopupOpen) removeTarget();
            break;
    }
}

// 클릭 타겟 수정
const updateTarget = () => {
    const popup = document.querySelector('.target-detail-popup');
    const text = popup.querySelector('.text');
    const _class = popup.querySelector('.class');
    const colspan = popup.querySelector('.colspan');
    const rowspan = popup.querySelector('.rowspan');
    const addTag = popup.querySelector('.tag');
    
    currentTarget.textContent = text.value;

    if(_class.value !== '') {
        currentTarget.className = `${_class.value}`;
    } else {
        currentTarget.className = '';
    }

    colspan.value !== '' ? currentTarget.setAttribute('colspan', `${colspan.value}`) : currentTarget.removeAttribute('colspan');
    rowspan.value !== '' ? currentTarget.setAttribute('rowspan', `${rowspan.value}`) : currentTarget.removeAttribute('rowspan');

    closeDetailPopup();

    isUpdate = true;
}

// 클릭 타켓 삭제
const removeTarget = () => {
    const parentTr = currentTarget.closest('tr');

    currentTarget.nextSibling.nodeName === '#text' && currentTarget.nextSibling.remove();
    currentTarget.remove();

    if(parentTr && parentTr.children.length === 0) {
        parentTr.remove();
    }
    
    closeDetailPopup();
    setDetailPopupData({ text: '', class: '', colspan: '', rowspan: '', addTag: '' });

    isUpdate = true;
    isDelete = true;
}

// 클릭 타겟 data 갖고 오기
const getTargetData = target => {
    return  {
        text: target.childNodes[0] ? target.childNodes[0].textContent : '',
        class: target.getAttribute('class'),
        colspan: target.getAttribute('colspan'),
        rowspan: target.getAttribute('rowspan'),
        addTag: () => Array.from(target.children).reduce((acc, cur) => acc + cur.outerHTML, ''),
    };
}

// 팝업 내용 설정
const setDetailPopupData = data => {
    const popup = document.querySelector('.target-detail-popup');
    const text = popup.querySelector('.text');
    const _class = popup.querySelector('.class');
    const colspan = popup.querySelector('.colspan');
    const rowspan = popup.querySelector('.rowspan');
    const addTag = popup.querySelector('.tag');

    text.value = data.text;
    _class.value = data.class;
    colspan.value = data.colspan;
    rowspan.value = data.rowspan;
    addTag.value = data.addTag ? data.addTag() : '';
}

// 팝업 닫기 (target-datial-popup)
const closeDetailPopup = () => {
    const popup = document.querySelector('.target-detail-popup');

    popup.style.transform = '';
    popup.classList.remove('show');

    if(!currentTarget) return;

    currentTarget.classList.remove('target');
    currentTarget.className === '' || currentTarget.className.split(' ').length === 0 && currentTarget.removeAttribute('class');

    currentTarget = null;
}

// 팝업 열기 (target-datial-popup) 수정
const openDetailPopup = e => {
    e.stopPropagation();
    if(e.target.nodeName === 'TABLE') return;

    // 추가: Shift+클릭 처리
    if(e.shiftKey) {
        const target = e.target.nodeName !== "TD" && e.target.nodeName !== "TH" ? e.target.closest('td') : e.target;
        
        if(!target) return;

        // 첫 번째 선택
        if(selectedTargets.length === 0) {
            firstSelectedTarget = target;
            selectedTargets.push(target);
            target.classList.add('multi-selected');
            createMergeButton(e.clientX, e.clientY);
        } else if(selectedTargets.includes(target)) {
            // 이미 선택된 셀 제거
            target.classList.remove('multi-selected');
            selectedTargets = selectedTargets.filter(cell => cell !== target);
            
            if(selectedTargets.length === 0) {
                clearMultiSelection();
            } else {
                createMergeButton(e.clientX, e.clientY);
            }
        } else {
            // 새로운 셀 추가
            selectedTargets.push(target);
            target.classList.add('multi-selected');
            createMergeButton(e.clientX, e.clientY);
        }
        return;
    }

    // 추가: 기존 다중 선택 상태 초기화
    if(selectedTargets.length > 0) {
        clearMultiSelection();
    }

    if(currentTarget === e.target) {
        closeDetailPopup();
        return;
    }

    const popup = document.querySelector('.target-detail-popup');
    const popupStyle = window.getComputedStyle(popup);
    const target = e.target.nodeName !== "TD" && e.target.nodeName !== "TH" ? e.target.closest('td') : e.target;
    const targetRect = target.getBoundingClientRect();
    const data = getTargetData(target);
    const scrollMove = () => {
        if(targetRect.top + parseInt(popupStyle.height, 10) > window.innerHeight) {
            let diifY = targetRect.top + parseInt(popupStyle.height, 10) - window.innerHeight;
            let addY = 200;

            window.scrollTo(0, window.scrollY + diifY + addY);
        }
    }

    currentTarget = target;

    setDetailPopupData(data);

    document.querySelector('.target')?.classList.remove('target');
    target.classList.add('target');
    popup.style.transform = `translate3d(${targetRect.left + targetRect.width}px, ${targetRect.top + window.scrollY}px, 0)`;
    popup.classList.add('show');

    scrollMove();
}

// 일괄 변경
const updateChange = () => {
    const changeTarget = document.querySelector('input[name=change-target]:checked').value;
    const changeIndexInput = document.querySelector('.change-index').value.trim();
    const changeTag = document.querySelector('.change-tag');
    const addAttribute = document.querySelector('.add-attribute');
    const resultTable = document.querySelector('#result table');
    
    if(!changeIndexInput) {
        alert('번호 또는 "all"을 입력해주세요...😒');
        return;
    }

    const isAll = changeIndexInput.toLowerCase() === 'all';
    const changeIndex = isAll ? null : parseInt(changeIndexInput);

    if(!isAll && (!changeIndex || changeIndex < 1)) {
        alert('올바른 번호를 입력해주세요...😒');
        return;
    }

    const isChangeValue = changeTag.value !== '';
    const matchResult = addAttribute.value.match(/([^=]+)="([^"]+)"/);
    const isMatchResult = matchResult !== null;
    const attributeName = isMatchResult && matchResult[1];
    const attributeContent = isMatchResult && matchResult[2];

    if(changeTarget === 'row') {
        const rows = resultTable.querySelectorAll('tr');
        
        if(isAll) {
            // 모든 행의 첫 번째 셀 변경
            rows.forEach((tr, rowIndex) => {
                const td = tr.children[0];
                
                if(isChangeValue) {
                    const changeElement = document.createElement(changeTag.value);
                    changeElement.innerHTML = td.innerHTML;
                    isMatchResult && changeElement.setAttribute(attributeName, attributeContent);
                    td.parentNode.replaceChild(changeElement, td);
                } else {
                    isMatchResult && td.setAttribute(attributeName, attributeContent);
                }
            });
        } else {
            // 특정 행의 첫 번째 셀만 변경
            if(changeIndex > rows.length) {
                alert(`${rows.length}개 이하의 번호를 입력해주세요...😒`);
                return;
            }

            const tr = rows[changeIndex - 1];
            const td = tr.children[0];
            
            if(isChangeValue) {
                const changeElement = document.createElement(changeTag.value);
                changeElement.innerHTML = td.innerHTML;
                isMatchResult && changeElement.setAttribute(attributeName, attributeContent);
                td.parentNode.replaceChild(changeElement, td);
            } else {
                isMatchResult && td.setAttribute(attributeName, attributeContent);
            }
        }
    } else if(changeTarget === 'col') {
        const rows = resultTable.querySelectorAll('tr');
        
        if(isAll) {
            // 모든 열의 첫 번째 행의 셀 변경
            if(rows.length > 0) {
                Array.from(rows[0].children).forEach((td) => {
                    if(isChangeValue) {
                        const changeElement = document.createElement(changeTag.value);
                        changeElement.innerHTML = td.innerHTML;
                        isMatchResult && changeElement.setAttribute(attributeName, attributeContent);
                        td.parentNode.replaceChild(changeElement, td);
                    } else {
                        isMatchResult && td.setAttribute(attributeName, attributeContent);
                    }
                });
            }
        } else {
            // 특정 열의 첫 번째 행의 셀만 변경
            let maxCols = 0;
            rows.forEach(tr => {
                maxCols = Math.max(maxCols, tr.children.length);
            });

            if(changeIndex > maxCols) {
                alert(`${maxCols}개 이하의 번호를 입력해주세요...😒`);
                return;
            }

            if(rows.length > 0) {
                const td = rows[0].children[changeIndex - 1];
                
                if(td) {
                    if(isChangeValue) {
                        const changeElement = document.createElement(changeTag.value);
                        changeElement.innerHTML = td.innerHTML;
                        isMatchResult && changeElement.setAttribute(attributeName, attributeContent);
                        td.parentNode.replaceChild(changeElement, td);
                    } else {
                        isMatchResult && td.setAttribute(attributeName, attributeContent);
                    }
                }
            }
        }
    }

    closePartChangePopup();

    changeTag.value = '';
    addAttribute.value = '';
    document.querySelector('.change-index').value = '';

    isUpdate = true;
}

// 팝업 닫기 (part-change-popup)
const closePartChangePopup = () => {
    const popup = document.querySelector('.part-change-popup');
    popup.classList.remove('show');
}

// 팝업 열기 (part-change-popup)
const openPartChagePopup = e => {
    if(!isRender) {
        alert('실행 후 가능합니다만...😒');
        return;
    }

    const popup = document.querySelector('.part-change-popup');
    popup.classList.add('show');
}

// 초기화
const reset = () => {
    const inputs = document.querySelectorAll('input');
    const inputOptions2 = document.querySelectorAll('.option2');
    const testArea = document.querySelector('textarea');

    inputs.forEach(v => {
        v.value = '';
    });

    inputOptions2.forEach((v, i) => {
        if(3 < i) v.remove(); 
    });

    testArea.value = '';
    result.innerHTML = '';
    text.textContent = '';

    isUpdate =  false;

    closeDetailPopup();
    clearMultiSelection();  // 추가
    setDetailPopupData({ text: '', class: '', colspan: '', rowspan: '', addTag: '' });
}

// TD, TH 클래스 옵션 input 추가
const addOption = e => {
    const target = e.target;
    const options2 = document.querySelectorAll('.option2');
    const input = `<input type="text" class="option2" placeholder="${options2.length + 1}번 class(값이 없으면 X)">`;

    target.insertAdjacentHTML('beforebegin', input);
    Array.from(document.querySelectorAll('.option2')).at(-1).addEventListener('change', e => setClassOption2(e));
}

// 클립보드 복사 
const setClipboard = () => {
    if(text.textContent === '') {
        alert('데이터를 입력해주세요...😒');
        return;
    }

    const { ClipboardItem } = window;
    const type = 'text/plain';
    const blob = new Blob([text.textContent], { type });
    const data = [new ClipboardItem({ [type]: blob })];

    navigator.clipboard.write(data).then(
        () => alert('복사 성공 😊'),
        () => alert('복사 살패 😒'),
    )
}

// table, text dom에 render
const render = () => {
    const textArea = document.querySelector('textarea');
    const textArray = textArea.value.trim().split(/(?<!\t)\n(?!\t\t)|(?<=\t)\n(?!\t)|(?<=\t)\n(?=\t\t)|(?<=[^\n]\t[^\n]*\t)\n(?=\t)/);
    const direction = getOrderDirection();
    const classCheck = isClassApply();
    const isClassOption = classOption.length > 0;

    if(isUpdate) {
        const check = confirm('테이블 수정 이력이 있는데 괜찮으세요...?😒');

        if(!check) return;
    }
    
    if(textArea.value.length < 10) {
        alert('데이터를 입력해주세요...😒');
        return;
    }

    if(isClassOption) {
        setClassBgColor();
    }

    const html = textArray.reduce((acc, row, index) => {
        const cell = row
            .trim()
            .replace(/\n\t\t/g, '<br>')
            .replace(/\t\n\t/g, '<br>')
            .split('\t')
            .filter(item => item !== "");

        const isOptionValue = classOption[1]?.split(',').includes(`${index + 1}`);
        const isOptionAll = classOption.includes('all');
        const trClass = isClassOption 
            && (
                (direction === 'forward' && isOptionValue) || 
                (direction === 'reverse' && !isOptionValue) || 
                isOptionAll
            )
            ? ` class="${classOption[0]}"` 
            : '';
        
        acc += `        <tr${trClass}>\n`;

        for (let j = 0; j < cell.length; j++) {
            const tdClass = classCheck && classOption2[j] !== undefined && classOption2[j] !== '' 
                ? ` class="${classOption2[j]}"` 
                : '';
            
            const cellValue = cell[j] ? cell[j].trim() : '';

            acc += `            <td${tdClass}>${cellValue}</td>\n`;
        }

        acc += '        </tr>\n';

        return acc;
    }, '<table>\n    <tbody>\n') + '    </tbody>\n</table>';

    result.innerHTML = html;
    text.textContent = html;

    isRender = true;
}

// table, text dom에 re render
const reRender = () => {
    if(document.querySelector('textarea').value.length < 10) {
        alert('데이터를 입력해주세요...😒');
        return;
    }

    if(!isUpdate) {
        alert('테이블을 수정한 이력이 없어요...😒 \n테이블을 클릭해서 수정 해보세요!✍');
        return;
    }

    if(isDelete && classOption2.length > 0) {
        alert('삭제한 DOM이 존재합니다...😒 \nTD 또는 TH의 클래스 옵션이 존재한다면 클래스가 정확하게 추가 안될 수 있습니다.(클래스 미적용도 같이)');
        isDelete = false;
    }

    text.textContent = result.innerHTML;

    const isOptionAll = classOption.includes('all');
    const isClassOption = classOption.length > 0;
    const direction = getOrderDirection();
    const classCheck = isClassApply();
    const trs = result.querySelectorAll('tr');

    for (let i = 0; i < trs.length; i++) {
        const tr = trs[i];
        const childrens = tr.children;
        const isOptionValue = classOption[1]?.split(',').includes(`${i + 1}`);
        
        if(
            isClassOption 
            && ((direction === 'forward' && isOptionValue) || (direction === 'reverse' && !isOptionValue))
            || isOptionAll
        ) {
            tr.classList.add(classOption[0]);
        } else {
            tr.removeAttribute('class');
        }

        if(classCheck) {
            for(let j = 0; j < childrens.length; j++) {
                const children = childrens[j];  

                if(classOption2[j] !== undefined && classOption2[j] !== '') {
                    children.className = `${classOption2[j]}`;
                } else {
                    children.className = '';
                    children.removeAttribute('class');
                }
            }
        }
    }

    if(isClassOption) {
        setClassBgColor();
    }

    text.textContent = result.innerHTML;
}

// TR 순서 설정 값 가져오기
const getOrderDirection = () => {
    const orders = document.querySelectorAll('input[name=order]');
    let direction = 'forward';

    if(orders[1].checked === true) direction = 'reverse';

    return direction;
}

// TR 옵션 클랙스 색 설정
const setClassBgColor = () => {
    document.querySelector('.add-style')?.remove();

    const head = document.querySelector('head');
    const style = document.createElement('style');
    style.classList.add('add-style');
    style.innerHTML = `.${classOption[0]} {background-color: antiquewhite;}`;
    head.appendChild(style);
}

// TD, TH 클래스 옵션 적용 여부
const isClassApply = () => {
    const applys = document.querySelectorAll('input[name=apply]');
    let check = true;

    if(applys[1].checked === true) check = false;

    return check;
}

// TR 클래스 특정 순서 옵션 설정 - option
const setClassOption = e => {
    const target = e.target;
    const inputOption = document.querySelectorAll('.option');

    classOption = [];

    inputOption.forEach(input => classOption.push(input.value));

    console.log('옵션 저장 1 😊', classOption);
}

// TD, TH 클래스 옵션 설정 - option2
const setClassOption2 = e => {
    const target = e.target;
    const inputOption2 = document.querySelectorAll('.option2');

    classOption2 = [];

    inputOption2.forEach(input => classOption2.push(input.value));

    console.log('옵션 저장 2 😊', classOption2);
}