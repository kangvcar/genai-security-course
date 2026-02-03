# 第4章：AI 安全测试环境搭建

学习 AI 安全不能只停留在理论层面，我们需要一个实际的环境来进行实验和测试。就像学习游泳必须下水，学习 AI 安全也需要亲手操作真实的模型和工具。本章将指导大家搭建一个完整的 AI 安全测试环境，包括云平台的使用、Python 环境配置、核心依赖库的安装，以及常见问题的解决方法。通过本章的学习，你将拥有一个可以进行后续所有实验的工作环境。

## 章节目标

学完本章后，你将能够：

1. **掌握云平台的使用**：熟练使用腾讯 Cloud Studio 创建和管理 GPU 开发环境
2. **配置 Python 环境**：正确安装和配置 Python 及相关依赖库，理解虚拟环境的作用
3. **调用大语言模型**：能够使用 Transformers 库加载和运行预训练模型
4. **排查常见问题**：识别和解决环境搭建过程中的典型问题
5. **建立良好的实验习惯**：理解代码管理、资源监控等最佳实践

## 1. 为什么选择云平台

### 1.1 本地环境 vs 云平台

在开始搭建环境之前，我们先思考一个问题：为什么要使用云平台，而不是在自己的电脑上搭建环境？

**本地环境的挑战**：

1. **硬件要求高**：运行大语言模型需要强大的 GPU。一块适合深度学习的显卡（如 NVIDIA RTX 4090）价格在万元以上，对于学习来说成本太高。

2. **配置复杂**：需要安装 CUDA、cuDNN 等底层驱动，不同的硬件和操作系统配置方法各异，容易出现兼容性问题。

3. **环境污染**：在本地安装各种库和工具，可能与其他项目冲突，导致环境混乱。

4. **资源浪费**：GPU 只在运行实验时才需要，平时闲置造成资源浪费。

**云平台的优势**：

1. **免费的 GPU 资源**：腾讯 Cloud Studio 提供免费的 NVIDIA T4 GPU（16GB 显存），足够运行本课程的所有实验。

2. **开箱即用**：环境已经预配置好，包括 Python、CUDA、常用库等，无需复杂的安装过程。

3. **随时随地访问**：只需要浏览器和网络，在任何设备上都能访问你的开发环境。

4. **按需使用**：用完即停，不占用本地资源，也不产生额外费用。

5. **国内访问稳定**：相比国外平台（如 Google Colab），国内访问速度快，模型下载稳定。

让我们通过一个类比来理解：

使用云平台就像租用健身房，而不是在家里建一个健身房。你只需要在需要锻炼时去健身房，使用专业的器材，用完就走。不需要自己购买昂贵的设备，也不需要担心维护和空间占用。

### 1.2 腾讯 Cloud Studio 简介

腾讯 Cloud Studio 是一个基于浏览器的云端开发环境，专为开发者设计。它的主要特点包括：

**硬件配置**：
- CPU：多核处理器
- GPU：NVIDIA Tesla T4（16GB 显存）
- 内存：根据配置不同，通常 8GB 以上
- 存储：足够的磁盘空间用于存储代码和模型

**软件环境**：
- 操作系统：Linux（Ubuntu）
- Python：预装 Python 3.x
- Jupyter Notebook：支持交互式编程
- Git：支持版本控制

**使用限制**：
- 免费版有使用时长限制（通常每月一定小时数）
- 长时间不操作会自动断开连接
- 需要定期保存工作成果

有同学可能会问：如果云平台有使用时长限制，会不会不够用？根据课程设计，每个实验的运行时间都控制在 5 分钟以内，即使加上调试和学习时间，每个实验也不会超过 30 分钟。整个课程的实验总时长在 10 小时以内，完全在免费额度范围内。

## 2. 创建和配置 Cloud Studio 环境

### 2.1 注册和登录

**步骤 1：访问 Cloud Studio**

打开浏览器，访问：https://cloudstudio.net/

**步骤 2：注册账号**

如果是第一次使用，需要注册账号：
- 可以使用微信、QQ 或手机号注册
- 按照提示完成实名认证（部分功能需要）

**步骤 3：登录**

使用注册的账号登录系统。

### 2.2 创建工作空间

登录后，我们需要创建一个工作空间（Workspace），这是我们进行实验的环境。

**步骤 1：点击"创建工作空间"**

在主界面找到"创建工作空间"或"New Workspace"按钮。

**步骤 2：选择模板**

Cloud Studio 提供多种预配置模板，我们选择：
- **Python 3** 或 **Data Science** 模板
- 这些模板已经预装了 Python 和常用的数据科学库

**步骤 3：配置资源**

- **名称**：给工作空间起一个有意义的名字，如"AI-Security-Lab"
- **GPU**：选择启用 GPU（NVIDIA T4）
- **存储**：使用默认配置即可

**步骤 4：创建**

点击"创建"按钮，系统会自动初始化环境，这个过程通常需要 1-2 分钟。

### 2.3 熟悉界面

创建完成后，你会看到一个类似 VS Code 的界面：

**左侧边栏**：
- 文件浏览器：查看和管理文件
- 搜索：在项目中搜索内容
- Git：版本控制功能
- 扩展：安装插件

**中间区域**：
- 代码编辑器：编写和编辑代码
- 终端：执行命令行操作

**右侧（可选）**：
- 预览窗口：查看网页或文档

**底部**：
- 终端面板：显示命令输出
- 问题面板：显示代码错误和警告

### 2.4 打开终端

大部分配置工作需要在终端中完成。打开终端的方法：

- 点击顶部菜单：Terminal → New Terminal
- 或使用快捷键：Ctrl + `（反引号）

终端打开后，你会看到一个命令行界面，类似这样：

```
user@cloudstudio:~/workspace$
```

这表示你已经进入了 Linux 命令行环境。

## 3. Python 环境配置

### 3.1 检查 Python 版本

首先，我们需要确认 Python 已经正确安装。在终端中输入：

```bash
python --version
```

或者：

```bash
python3 --version
```

你应该看到类似这样的输出：

```
Python 3.8.10
```

或更高版本（3.8、3.9、3.10 都可以）。

如果显示"command not found"，说明 Python 没有安装，需要联系平台支持。

### 3.2 理解虚拟环境

在安装依赖库之前，我们需要理解一个重要概念：虚拟环境（Virtual Environment）。

**为什么需要虚拟环境？**

想象你在做多个项目：
- 项目 A 需要 transformers 4.30 版本
- 项目 B 需要 transformers 4.40 版本

如果直接在系统中安装，两个版本会冲突。虚拟环境就像给每个项目创建一个独立的"房间"，每个房间有自己的库版本，互不干扰。

**创建虚拟环境**：

在终端中执行：

```bash
python3 -m venv ai_security_env
```

这会创建一个名为 `ai_security_env` 的虚拟环境。

**激活虚拟环境**：

```bash
source ai_security_env/bin/activate
```

激活后，终端提示符会变成：

```
(ai_security_env) user@cloudstudio:~/workspace$
```

前面的 `(ai_security_env)` 表示虚拟环境已激活。

**退出虚拟环境**（暂时不需要）：

```bash
deactivate
```

### 3.3 升级 pip

pip 是 Python 的包管理工具，用于安装和管理第三方库。我们先升级到最新版本：

```bash
pip install --upgrade pip
```

这个命令会将 pip 升级到最新版本，确保后续安装过程顺利。

### 3.4 安装核心依赖库

根据课程设计，我们需要安装以下核心库：

```bash
pip install transformers==4.40.0 torch==2.1.0 numpy==1.24.3 matplotlib==3.7.1 accelerate==0.27.0
```

让我们理解每个库的作用：

**1. transformers（4.40.0）**
- 作用：Hugging Face 提供的预训练模型库，包含 GPT、BERT 等各种模型
- 用途：加载和使用大语言模型

**2. torch（2.1.0）**
- 作用：PyTorch 深度学习框架
- 用途：模型的底层计算引擎

**3. numpy（1.24.3）**
- 作用：数值计算库
- 用途：处理数组和矩阵运算

**4. matplotlib（3.7.1）**
- 作用：数据可视化库
- 用途：绘制实验结果图表

**5. accelerate（0.27.0）**
- 作用：加速库，优化 GPU 使用
- 用途：提高模型加载和推理速度

安装过程可能需要 5-10 分钟，请耐心等待。安装完成后，你会看到类似这样的提示：

```
Successfully installed transformers-4.40.0 torch-2.1.0 ...
```

### 3.5 验证安装

安装完成后，我们需要验证库是否正确安装。在终端中启动 Python：

```bash
python
```

然后依次输入以下命令：

```python
import torch
print(f"PyTorch version: {torch.__version__}")
print(f"CUDA available: {torch.cuda.is_available()}")

import transformers
print(f"Transformers version: {transformers.__version__}")

import numpy as np
print(f"NumPy version: {np.__version__}")

import matplotlib
print(f"Matplotlib version: {matplotlib.__version__}")
```

如果一切正常，你应该看到：

```
PyTorch version: 2.1.0
CUDA available: True
Transformers version: 4.40.0
NumPy version: 1.24.3
Matplotlib version: 3.7.1
```

特别注意 `CUDA available: True`，这表示 GPU 可用。如果显示 `False`，说明 GPU 没有正确配置。

输入 `exit()` 退出 Python 交互环境。

## 4. 第一个实验：加载和运行模型

环境配置完成后，让我们运行一个简单的实验，验证一切工作正常。

### 4.1 创建 Jupyter Notebook

Jupyter Notebook 是一种交互式编程环境，非常适合进行实验和学习。

**步骤 1：创建新文件**

在文件浏览器中，右键点击空白处，选择"New File"，命名为 `test_model.ipynb`。

**步骤 2：打开 Notebook**

双击文件，Cloud Studio 会自动打开 Jupyter Notebook 界面。

### 4.2 编写测试代码

在第一个代码单元格中，输入以下代码：

```python
# 导入必要的库
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM

# 检查 GPU 是否可用
device = "cuda" if torch.cuda.is_available() else "cpu"
print(f"使用设备: {device}")

# 加载模型和分词器
model_name = "Qwen/Qwen2-1.5B-Instruct"
print(f"正在加载模型: {model_name}")

tokenizer = AutoTokenizer.from_pretrained(model_name, trust_remote_code=True)
model = AutoModelForCausalLM.from_pretrained(
    model_name,
    torch_dtype=torch.float16,
    device_map="auto",
    trust_remote_code=True
)

print("模型加载完成！")

# 测试模型
prompt = "你好，请介绍一下人工智能。"
messages = [{"role": "user", "content": prompt}]
text = tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
inputs = tokenizer([text], return_tensors="pt").to(device)

outputs = model.generate(**inputs, max_new_tokens=100)
response = tokenizer.decode(outputs[0], skip_special_tokens=True)

print("\n模型回复:")
print(response)
```

### 4.3 运行代码

点击代码单元格左侧的"运行"按钮（或按 Shift + Enter）。

**第一次运行时**，模型需要从网络下载，这个过程可能需要 3-5 分钟。你会看到下载进度：

```
Downloading model.safetensors: 100%|██████████| 3.09G/3.09G [02:30<00:00, 20.5MB/s]
```

下载完成后，模型会自动加载并运行。你应该看到类似这样的输出：

```
使用设备: cuda
正在加载模型: Qwen/Qwen2-1.5B-Instruct
模型加载完成！

模型回复:
你好！人工智能（Artificial Intelligence，简称AI）是计算机科学的一个分支...
```

如果看到这样的输出，恭喜你！环境搭建成功，模型运行正常。

### 4.4 理解代码

让我们逐行理解这段代码：

**1. 导入库**
```python
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM
```
导入 PyTorch 和 Transformers 库的核心组件。

**2. 检查设备**
```python
device = "cuda" if torch.cuda.is_available() else "cpu"
```
检查 GPU 是否可用。如果可用，使用 GPU（cuda）；否则使用 CPU。

**3. 加载分词器和模型**
```python
tokenizer = AutoTokenizer.from_pretrained(model_name, trust_remote_code=True)
model = AutoModelForCausalLM.from_pretrained(...)
```
- `AutoTokenizer`：自动选择合适的分词器
- `AutoModelForCausalLM`：自动选择合适的语言模型
- `from_pretrained`：从预训练权重加载模型
- `trust_remote_code=True`：允许执行模型自定义代码（某些模型需要）

**4. 准备输入**
```python
messages = [{"role": "user", "content": prompt}]
text = tokenizer.apply_chat_template(messages, ...)
inputs = tokenizer([text], return_tensors="pt").to(device)
```
- 将用户输入格式化为模型期望的对话格式
- 使用分词器将文本转换为模型可以理解的数字序列
- 将输入移动到 GPU 上

**5. 生成回复**
```python
outputs = model.generate(**inputs, max_new_tokens=100)
response = tokenizer.decode(outputs[0], skip_special_tokens=True)
```
- `model.generate`：让模型生成文本
- `max_new_tokens=100`：最多生成 100 个 token
- `tokenizer.decode`：将数字序列转换回文本

有同学可能会问：为什么要使用 `torch.float16` 而不是 `torch.float32`？这是因为半精度浮点数（float16）占用的显存更少，运行速度更快，而对于大多数任务，精度损失可以忽略不计。这是一种常见的优化技巧。

## 5. 常见问题与解决方案

在环境搭建和使用过程中，可能会遇到一些问题。这里列举常见问题及解决方法。

### 5.1 GPU 不可用

**问题表现**：
```python
torch.cuda.is_available()  # 返回 False
```

**可能原因**：
1. 创建工作空间时没有选择 GPU
2. GPU 资源已用完（免费额度耗尽）
3. 平台临时故障

**解决方法**：
1. 重新创建工作空间，确保选择 GPU 选项
2. 检查账户的 GPU 使用额度
3. 如果是平台问题，稍后再试或联系客服

**临时方案**：
如果 GPU 暂时不可用，可以使用 CPU 运行实验，只是速度会慢一些。代码会自动适配：
```python
device = "cuda" if torch.cuda.is_available() else "cpu"
```

### 5.2 模型下载失败

**问题表现**：
```
ConnectionError: Can't load model from 'Qwen/Qwen2-1.5B-Instruct'
```

**可能原因**：
1. 网络连接不稳定
2. Hugging Face 服务器访问受限
3. 磁盘空间不足

**解决方法**：

**方法 1：重试下载**
多次运行代码，有时网络波动会导致下载中断。

**方法 2：使用国内镜像**
```python
import os
os.environ['HF_ENDPOINT'] = 'https://hf-mirror.com'
```
在加载模型前添加这行代码，使用国内镜像站。

**方法 3：手动下载**
如果自动下载一直失败，可以手动下载模型文件，然后从本地加载。

### 5.3 显存不足

**问题表现**：
```
RuntimeError: CUDA out of memory
```

**可能原因**：
1. 模型太大，超过 GPU 显存（16GB）
2. 同时运行了多个模型
3. 批处理大小（batch size）太大

**解决方法**：

**方法 1：使用更小的模型**
本课程选择的 Qwen2-1.5B 模型已经是较小的模型，正常情况下不会超过显存。

**方法 2：清理显存**
```python
import torch
torch.cuda.empty_cache()
```

**方法 3：减少批处理大小**
如果在批量处理数据时出现问题，减少每次处理的数据量。

### 5.4 依赖库版本冲突

**问题表现**：
```
ImportError: cannot import name 'xxx' from 'transformers'
```

**可能原因**：
安装的库版本不匹配。

**解决方法**：

**方法 1：严格按照指定版本安装**
```bash
pip install transformers==4.40.0 torch==2.1.0 --force-reinstall
```

**方法 2：创建新的虚拟环境**
如果环境已经混乱，最简单的方法是创建一个全新的虚拟环境：
```bash
deactivate  # 退出当前环境
rm -rf ai_security_env  # 删除旧环境
python3 -m venv ai_security_env  # 创建新环境
source ai_security_env/bin/activate  # 激活新环境
pip install ...  # 重新安装依赖
```

### 5.5 连接超时

**问题表现**：
长时间不操作后，Cloud Studio 自动断开连接。

**解决方法**：
1. 定期保存工作成果（Ctrl + S）
2. 重要代码提交到 Git 仓库
3. 重新连接后，虚拟环境需要重新激活

## 6. 良好的实验习惯

### 6.1 代码管理

**使用 Git 版本控制**：

即使是学习项目，也建议使用 Git 管理代码：

```bash
git init
git add .
git commit -m "初始化项目"
```

这样可以：
- 追踪代码变化
- 回退到之前的版本
- 与他人协作

**组织文件结构**：

建议的项目结构：
```
ai-security-lab/
├── notebooks/          # Jupyter Notebook 文件
│   ├── lab1_1.ipynb
│   ├── lab1_2.ipynb
│   └── ...
├── data/              # 数据文件
├── models/            # 保存的模型
├── results/           # 实验结果
└── README.md          # 项目说明
```

### 6.2 资源监控

**监控 GPU 使用**：

在终端中运行：
```bash
nvidia-smi
```

这会显示 GPU 的使用情况，包括显存占用、温度等信息。

**监控磁盘空间**：

```bash
df -h
```

查看磁盘使用情况，避免空间不足。

### 6.3 定期清理

**清理不需要的文件**：

模型文件通常很大，实验结束后可以删除：
```bash
rm -rf ~/.cache/huggingface/hub/
```

这会删除下载的模型缓存，下次使用时会重新下载。

**清理 Python 缓存**：

```bash
find . -type d -name "__pycache__" -exec rm -r {} +
```

### 6.4 文档记录

**记录实验过程**：

在 Notebook 中使用 Markdown 单元格记录：
- 实验目的
- 参数设置
- 观察结果
- 遇到的问题和解决方法

这不仅帮助自己复习，也方便与他人交流。

## 本章小结

本章我们完成了 AI 安全测试环境的搭建。让我们回顾关键要点：

1. **云平台的选择**：腾讯 Cloud Studio 提供免费的 GPU 资源，开箱即用，非常适合学习和实验。

2. **Python 环境配置**：通过虚拟环境隔离项目依赖，使用 pip 安装核心库（transformers、torch、numpy、matplotlib、accelerate）。

3. **模型加载和运行**：学会使用 Transformers 库加载预训练模型，理解从输入到输出的完整流程。

4. **问题排查**：掌握常见问题的识别和解决方法，包括 GPU 不可用、模型下载失败、显存不足等。

5. **良好习惯**：建立代码管理、资源监控、定期清理、文档记录等良好的实验习惯。

现在，你已经拥有了一个完整的 AI 安全测试环境。在下一章中，我们将开始第一个真正的安全实验：AI 漏洞探测。

## 教学资源

**配套实验**：
- 实验 1.1：环境搭建与模型调用
  本章内容的完整实践，包括环境配置和模型测试

**推荐阅读**：
- Hugging Face Transformers 官方文档
- PyTorch 官方教程
- Cloud Studio 使用指南

**延伸学习**：
- 了解 Docker 容器技术（更高级的环境隔离方案）
- 学习 Jupyter Notebook 的高级功能
- 探索 Hugging Face Model Hub 上的其他模型

## 课后思考题

1. **理解性问题**：请解释虚拟环境的作用，为什么在 Python 项目中使用虚拟环境是一个好习惯？

2. **分析性问题**：在模型加载代码中，我们使用了 `torch.float16` 而不是 `torch.float32`。请分析这样做的优缺点，在什么情况下应该使用 float32？

3. **应用性问题**：假设你在运行实验时遇到了"CUDA out of memory"错误，但你确定模型大小没有超过 GPU 显存。请列出至少三种可能的原因和对应的排查方法。
