import SubCategories from "../../models/subCategory.js"

const findAllSubCategories = async (page, limit, column, sortDirection, filter_search, search) => {
  const pageInt = parseInt(page);
  const limitInt = parseInt(limit);

  let queryOptions = {
    status_sub_category: true
  };

  if (search) {
    let searchQuery = { $regex: new RegExp(search, 'i') }
    if (filter_search === 'title' || filter_search === 'slug' || filter_search === 'category.title') {
      queryOptions[filter_search] = searchQuery
      queryOptions['status_sub_category'] = true
    } else {
      queryOptions = {
        $or: [
          { 'title': searchQuery },
          { 'slug': searchQuery },
          { 'category.title': searchQuery },
        ]
      }
      queryOptions['status_sub_category'] = true
    }
  }

  let findSubCategories = await SubCategories.aggregate([
    {
      $lookup: {
        from: 'categories',
        localField: 'id_category',
        foreignField: '_id',
        as: 'category'
      },
    },
    {
      $unwind: {
        path: '$category'
      }
    },
    {
      $match: queryOptions
    },
    {
      $sort: {
        [column]: sortDirection === 'desc' ? -1 : 1
      }
    },
    {
      $facet: {
        data: [
          { $skip: (pageInt) * limitInt },
          { $limit: limitInt },
          {
            $project: {
              _id: 1,
              title: 1,
              slug: 1,
              created_at: 1,
              category: 1
            }
          }
        ],
        totalRows: [
          {
            $count: 'count'
          }
        ]
      }
    }
  ]);

  const totalRows = findSubCategories[0]?.totalRows[0]?.count
  const totalPage = Math.ceil(totalRows / limitInt);

  return {
    data: findSubCategories[0].data,
    page: pageInt,
    limit: limitInt,
    totalRows,
    totalPage
  };
}

const findSubCategoryById = async (id) => {
  const subCategory = await SubCategories.findById(id).populate('id_category', 'title')
  return subCategory
}

const findSubCategoryByTitle = async (title) => {
  const subCategory = await SubCategories.findOne({
    title, status_sub_category: true
  })
  return subCategory
}

const findSubCategoryBySlug = async (slug) => {
  const subCategory = await SubCategories.findOne({
    slug, status_sub_category: true
  })
  return subCategory
}

const findSubCategoriesByCategoryId = async (id) => {
  const subCategory = await SubCategories.find({
    id_category: id, status_sub_category: true
  })
  return subCategory
}

const insertSubCategory = async (data) => {
  const subCategory = await new SubCategories({
    title: data.newSubCategory.title,
    slug: data.newSubCategory.slug,
    id_category: data.newSubCategory.categoryId,
    created_by: data.user.email,
    updated_by: data.user.email
  }).save()
  return subCategory
}

const updateSubCategory = async (id, subCategoryData) => {
  const subCategory = await SubCategories.updateOne({ _id: id }, {
    $set: {
      title: subCategoryData.title,
      slug: subCategoryData.slug,
      id_category: subCategoryData.categoryId
    }
  })
  return subCategory
}

const deleteSubCategory = async (data) => {
  await SubCategories.findByIdAndUpdate({ _id: data.subCategoryId }, {
    $set: { status_sub_category: 0, deleted_by: data.user.email, deletedAt: Date.now() }
  })
}

export const subCategoryRepository = {
  findAllSubCategories,
  findSubCategoryById,
  findSubCategoryByTitle,
  findSubCategoryBySlug,
  findSubCategoriesByCategoryId,
  insertSubCategory,
  updateSubCategory,
  deleteSubCategory,
}