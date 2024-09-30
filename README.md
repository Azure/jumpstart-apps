# Arc Jumpstart Apps

Welcome to the Arc Jumpstart Apps source code repository! This repository is your go-to resource for all the Jumpstart applications/charts/containers used across the different Jumsptart products. Use this repository with the complement of  our [documentation repository](https://github.com/Azure/arc_jumpstart_docs) that eventually populates the [Arc Jumpstart](https://aka.ms/arcjumpstart) website.

<p align="center">
  <img src="https://github.com/Azure/arc_jumpstart_docs/raw/main/img/logo/jumpstart.png" alt="Arc Jumpstart logo" width="320">
</p>

## How to Utilize this repository

This source code repository is designed with contributors in mind and works in tandem with the [our documentation repository](https://github.com/Azure/arc_jumpstart_docs). While it's not mandatory, it's highly likely that contributors will need to clone both repositories to effectively contribute to Arc Jumpstart.

Before you start, we recommend familiarizing yourself with our comprehensive [contribution guidelines](https://aka.ms/JumpstartContribution). These guidelines outline the standards and practices we follow, ensuring consistency and quality across our documentation.

If you're unsure about your future contribution, don't hesitate to start a [GitHub discussion](https://aka.ms/JumpstartDiscussions). This is a great place to ask questions, share ideas, or get feedback on potential contributions. Our community is here to help and we welcome all levels of experience.

Happy contributing!


## Contributions

Follow these guidelines for submitting your code to the Jumpstart project repository.

### Folder Structure

#### First Level: Product Folder
The top-level folder should represent the product name. The available product folders are:

| Folder | Product Documentation | 
| ------ | --------------------- | 
| **agora** | [Jumpstart Agora](https://arcjumpstart.com/azure_jumpstart_ag) |
| **scenarios**  | [Jumpstart Scenarios](https://arcjumpstart.com/azure_arc_jumpstart) |
| **hcibox** | [Jumpstart HCIBox](https://arcjumpstart.com/azure_jumpstart_hcibox) |
| **arcbox** | [Jumpstart ArcBox](https://arcjumpstart.com/azure_jumpstart_arcbox) |
| **drops** | [Jumpstart Drops](https://arcjumpstart.com/azure_jumpstart_drops)|

>[!NOTE]
> Jumpstart Drops artifacts should be stored in the Drops [repository](https://github.com/Azure/arc_jumpstart_drops).

#### Second Level: Subproduct Folder
The second-level folder represents the subproduct, with the following considerations:

- For **scenarios**, use the scenario name (e.g., `contoso_bakeries`, `esa_fault_detection`).
- For other products, the folder should be the name of the container or component.
- Follow **snake_case** naming convention (lowercase and underscores).

#### Subfolders
Each subproduct folder should have the following subfolders:
1. **src** – This folder contains the code for the subproduct.
2. **operations** – This folder contains Helm charts and other deployment configurations.

>![NOTE] 
>If required, you can add extra folders for other artifacts, such as scripts or images.

**Example Folder Structure:**
```bash
agora/
    footfall_ai_api/
        src/
            Docker.manufacturing  # Points to mcr.microsoft.com/Jumpstart/Agora/footfall_ai_api:manufacturing
            Docker.healthcare     # Points to mcr.microsoft.com/Jumpstart/Agora/footfall_ai_api:healthcare
        operations/
            helm/                 # Helm charts should point to mcr.microsoft.com/Jumpstart/Agora/footfall_ai_api:{value-scenario}
        artifacts/                # Store non-code files like videos or documents here.
    pose_estimator_ai_api/
    main_ui/
    mqtt_simulator/
        src/
            main-supermarket.py
            main-manufacturing.py
            main-bakeries.py
            Dockerfile            # Dockerfile to handle builds for various environments.
        operations/
    ...
arcbox/
    hello_arc/
    bookstore/
scenarios/
    contoso_bakeries/
        mqtt_simulator/
    esa_fault_detection/
```

#### Naming Conventions
- Always use **lowercase** and **underscores** for folders and filenames (snake_case).
- Use descriptive names that clearly convey the purpose of the folder or file.

#### Dockerfile and Operations
- Each subproduct should include an appropriate **Dockerfile** for building containers. This will be reviewed before merging.
- Helm charts should be included in the **operations/helm** folder and aligned with the appropriate container and tag structure.

For example, in teh case of the `footfall_ai_api` container, the Dockerfile should push to specific tags:
- `mcr.microsoft.com/Jumpstart/Agora/footfall_ai_api:manufacturing`
- `mcr.microsoft.com/Jumpstart/Agora/footfall_ai_api:healthcare`

#### Working with Large Files
- Avoid committing large files directly to GitHub. For files that are too large, work with the Jumsptart team to create a download script instead of hosting them in the repository.

### Pull Request (PR) Process
1. **Prepare your PR**:
   - Ensure all unnecessary files are excluded.
   - Adhere to the folder structure and naming conventions mentioned above.
   
2. **Review**: Submit the PR for review. We’ll review your Dockerfiles and other artifacts before merging.

3. **Canary Pipeline**: Once your PR is merged, the pipeline will:
   - Identify containers that need to be rebuilt.
   - Build and tag a new version with the `:canary` tag.
   - Push the new containers to the **Microsoft Container Registry (MCR)** under the canary tag.
   - Run tests to validate the build.

4. **Main Pipeline**: After successful validation, the process is repeated for the `main` branch and production containers.

By following these guidelines, you will ensure a smooth submission process and maintain consistency across all products and scenarios.


## Branch guidance

The Jumpstart Apps repository handles branching similarly to the other Arc Jumpstart [repositories](https://github.com/Azure/arc_jumpstart_docs). Two primary branches are maintained, each one attached to a specific purpose: development or production.

The following branches are currently maintained:

| Branch | Description  |
| ------ | ------------ |
| [main](https://github.com/Azure/jumpstart-apps) (primary) | Latest publicly available Arc Jumpstart Aps artiafacts. This is the latest documentation and deployment scripts available. |
| [canary](https://github.com/Azure/jumpstart-apps/tree/canary) (preview) |  Pre-release artifacts and documentation. Document and code updates should be merged to the canary branch for preview validation before merging to the main branch. |

## Trademarks

This project may contain trademarks or logos for projects, products, or services. Authorized use of Microsoft trademarks or logos is subject to and must follow [Microsoft's Trademark & Brand Guidelines](https://www.microsoft.com/legal/intellectualproperty/trademarks/usage/general).

Use of Microsoft trademarks or logos in modified versions of this project must not cause confusion or imply Microsoft sponsorship.
Any use of third-party trademarks or logos are subject to those third-party's policies.

