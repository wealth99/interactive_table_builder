let isUpdate = false;
let isDelete = false;
let isRender = false;
let currentTarget;
let classOption = [];
let classOption2 = [];

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

    // textarea.addEventListener('keydown' , handleTextareaKeydown);
    document.addEventListener('keydown', handleDocumentKeydown);
    document.addEventListener('click', handleDocumentClick);
});

// textarea 키보드 이벤트 (사용 X)
const handleTextareaKeydown = e => {
    const target = e.target;

    // tab 키 사용 허용
    if (e.key === 'Tab') {
        e.preventDefault();

        const start = target.selectionStart;
        const end = target.selectionEnd;
        const value = target.value;

        target.value = value.substring(0, start) + '\t' + value.substring(end);
        target.selectionStart = target.selectionEnd = start + 1;
    }
}

// document 클릭 이벤트 (팝업 오픈시 적용)
const handleDocumentClick = e => {
    const isPopupOpen = document.querySelector('.target-detail-popup').classList.contains('show');

    if(!isPopupOpen) return;

    const target = e.target;
    const isPopup = target.closest('.target-detail-popup.show');

    if(!isPopup) closeDetailPopup();
}

// document 키보드 이벤트 (팝업 오픈시 적용)
const handleDocumentKeydown = e => {
    const isPopupOpen = document.querySelector('.target-detail-popup').classList.contains('show');
    const key = e.key.toLowerCase();

    if(!isPopupOpen) return;
    
    switch (key) {
        // case 'enter': updateTarget(); break;
        case 'escape': closeDetailPopup(); break;
        case 'delete': removeTarget(); break;
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
    currentTarget.insertAdjacentHTML('beforeend', addTag.value);

    closeDetailPopup();

    isUpdate = true;
}

// 클릭 타켓 삭제
const removeTarget = () => {
    currentTarget.nextSibling.nodeName === '#text' && currentTarget.nextSibling.remove();
    currentTarget.remove();

    closeDetailPopup();
    setDetailPopupData({ text: '', class: '', colspan: '', rowspan: '', addTag: '' });

    isUpdate = true;
    isDelete = true;
}

// 클릭 타겟 data 갖고 오기
const getTargetData = target => {
    return  {
        text: target.childNodes[0].textContent,
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

// 팝업 열기 (target-datial-popup)
const openDetailPopup = e => {
    e.stopPropagation();
    if(e.target.nodeName === 'TABLE') return;

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
    const changeTag = document.querySelector('.change-tag');
    const addAttribute = document.querySelector('.add-attribute');
    const resultTable = document.querySelector('#result table');
    const isChangeValue = changeTag.value !== '';
    const matchResult = addAttribute.value.match(/([^=]+)="([^"]+)"/);
    const isMatchResult = matchResult !== null;
    const attributeName = isMatchResult && matchResult[1];
    const attributeContent = isMatchResult && matchResult[2];

    resultTable.querySelectorAll('tr').forEach(v => {
        const td = v.children[0];
        let changeElement;

        if(isChangeValue) {
            changeElement = document.createElement(`${changeTag.value}`);
            changeElement.innerHTML = td.innerHTML;

            isMatchResult && changeElement.setAttribute(attributeName, attributeContent);
            td.parentNode.replaceChild(changeElement, td);
        }

        isMatchResult && td.setAttribute(attributeName, attributeContent);
    });

    closePartChangePopup();

    changeTag.value = '';
    addAttribute.value = '';

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
    const textArray = textArea.value.trim().split('\n');
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
        const cell = row.trim().split('\t');
        const isOptionValue = classOption[1]?.split(',').includes(`${index + 1}`);
        const isOptionAll = classOption.includes('all');
        const trClass = isClassOption 
            && (direction === 'forward' && isOptionValue) || (direction === 'reverse' && !isOptionValue)
            || isOptionAll
            ? ` class="${classOption[0]}"` 
            : '';
        
        acc += `        <tr${trClass}>\n`;

        for (let j = 0; j < cell.length; j++) {
            const tdClass = classCheck && classOption2[j] !== undefined && classOption2[j] !== '' ? ` class="${classOption2[j]}"` : '';

            acc += `            <td${tdClass}>${cell[j].trim()}</td>\n`;
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
        alert('삭제한 DOM이 존재합니다...😒 \nTD 또는 TH의 클래스 옵션이 존재한다면 클래스가 정확하게 추가 안될 수 있습니다.');
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
                    children.classList.add(classOption2[j]);
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