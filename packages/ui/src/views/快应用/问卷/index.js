export const types = [
    {value:0, label:"单选题"},
    {value:1, label:"多选题"},
    {value:2, label:"填空题"}
]

export const limits = [
    { value:0, label:"无限制", summary:"一个账号可以提交多份问卷，系统均保存" },
    { value:1, label:"一人仅限一份", summary:"一个账号只能提交一次" },
    { value:2, label:"可填多份取最新", summary:"一个账号能够多次提交，但只保留最新那份" },
]
